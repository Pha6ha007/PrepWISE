import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resend, FROM_EMAIL } from "@/lib/resend/client";

// Simple in-memory rate limit for contact form (3 per minute per IP)
const contactRateMap = new Map<string, { count: number; resetAt: number }>();
function checkContactRate(ip: string): boolean {
  const now = Date.now();
  const entry = contactRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    contactRateMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.enum(["general", "partnership"]),
  subject: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  partnershipType: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkContactRate(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = contactSchema.parse(body);

    const { name, email, message, type, subject: userSubject, company, role, partnershipType } = validatedData;

    // Prepare email content
    const emailSubject = type === "partnership" && company
      ? `[Prepwise Partnership] ${company}`
      : `[Prepwise Contact] ${name}`;

    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Type:</strong> ${type === "partnership" ? "Partnership Inquiry" : "General Inquiry"}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${userSubject ? `<p><strong>Subject:</strong> ${userSubject}</p>` : ""}
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
      ${role ? `<p><strong>Role:</strong> ${role}</p>` : ""}
      ${partnershipType ? `<p><strong>Partnership Type:</strong> ${partnershipType}</p>` : ""}
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `;

    // Send email via Resend
    await resend.emails.send({
      from: "Prepwise Contact Form <noreply@prepwise.app>",
      to: "hello@prepwise.app",
      replyTo: email,
      subject: emailSubject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
