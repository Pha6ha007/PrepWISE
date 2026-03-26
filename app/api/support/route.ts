import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SUPPORT_KNOWLEDGE } from '@/lib/support/knowledge'

// ── In-memory IP rate limiter ───────────────────────────────
// 10 messages per minute per IP. In-memory is fine here — this is a
// low-stakes support endpoint, and Vercel keeps warm functions alive
// long enough for the 60s window to be effective.

const RATE_LIMIT = 10
const WINDOW_MS = 60_000

const ipHits = new Map<string, { count: number; windowStart: number }>()

function checkIpRateLimit(ip: string): { allowed: boolean; resetIn: number } {
  const now = Date.now()
  const entry = ipHits.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipHits.set(ip, { count: 1, windowStart: now })
    return { allowed: true, resetIn: Math.ceil(WINDOW_MS / 1000) }
  }

  if (entry.count >= RATE_LIMIT) {
    const resetIn = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000)
    return { allowed: false, resetIn: Math.max(0, resetIn) }
  }

  entry.count++
  return {
    allowed: true,
    resetIn: Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000),
  }
}

// Periodic cleanup to prevent memory leaks (every 5 minutes)
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS
  for (const [ip, entry] of ipHits) {
    if (entry.windowStart < cutoff) ipHits.delete(ip)
  }
}, 5 * 60_000)

// ── OpenRouter client (lightweight, separate from agent client) ──

function getSupportClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://prepwise.app',
      'X-Title': 'PrepWISE Support',
    },
  })
}

// ── System prompt ───────────────────────────────────────────

const SYSTEM_PROMPT = `You are PrepWISE's friendly AI support assistant. Answer questions about PrepWISE — pricing, features, GMAT info, troubleshooting, and billing.

Rules:
- Be helpful, concise, and friendly
- Only answer questions about PrepWISE and GMAT preparation
- If asked something unrelated, politely redirect to PrepWISE topics
- Link to relevant pages when helpful (e.g., /dashboard/practice for practice questions)
- Never make up features or pricing that isn't in the knowledge base
- Keep answers short — 2-4 sentences unless more detail is needed
- If you don't know something, say so and suggest contacting us via /contact

${SUPPORT_KNOWLEDGE}`

// ── POST handler ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateCheck = checkIpRateLimit(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please wait a moment before asking another question.',
          resetIn: rateCheck.resetIn,
        },
        { status: 429 }
      )
    }

    // Parse & validate
    const body = await request.json()
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!message || message.length > 2000) {
      return NextResponse.json(
        { error: 'Message is required and must be under 2000 characters.' },
        { status: 400 }
      )
    }

    // Build conversation history (last 10 messages for context)
    const history: Array<{ role: 'user' | 'assistant'; content: string }> =
      Array.isArray(body.history)
        ? body.history.slice(-10).map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
            content: String(m.content).slice(0, 2000),
          }))
        : []

    const client = getSupportClient()

    const completion = await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response. Please try again.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('[Support API] Error:', error)

    // Surface specific errors
    if (error instanceof Error && error.message.includes('OPENROUTER_API_KEY')) {
      return NextResponse.json(
        { error: 'Support assistant is temporarily unavailable.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
