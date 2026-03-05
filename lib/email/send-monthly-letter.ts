// Confide Monthly Letter — Resend Email Sender
// Send warm monthly letter to user's email

import { resend, FROM_EMAIL } from '@/lib/resend/client';
import { generateMonthlyLetter, MonthlyLetterParams } from './monthly-letter';
import { format } from 'date-fns';

// ============================================
// TYPES
// ============================================

export interface SendMonthlyLetterParams extends MonthlyLetterParams {
  userEmail: string;
}

export interface SendMonthlyLetterResult {
  success: boolean;
  emailId?: string; // Resend email ID
  error?: string;
}

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Send monthly letter email via Resend
 * IMPORTANT: Does NOT throw errors — returns success/error status
 * Diary generation should never fail because of email issues
 */
export async function sendMonthlyLetter(
  params: SendMonthlyLetterParams
): Promise<SendMonthlyLetterResult> {
  try {
    const { userEmail, userName, companionName, month, year } = params;

    console.log(`[MONTHLY_LETTER] Sending to ${userEmail} for ${year}-${month}`);

    // Generate HTML content
    const htmlContent = generateMonthlyLetter(params);

    // Email subject
    const monthName = format(new Date(year, month - 1), 'MMMM yyyy');
    const subject = `${monthName}: A letter from ${companionName}`;

    // Send via Resend
    const result = await resend.emails.send({
      from: `${companionName} from Confide <${FROM_EMAIL}>`,
      to: userEmail,
      subject,
      html: htmlContent,
      // Plain text fallback
      text: generatePlainTextFallback(params),
    });

    if (result.error) {
      console.error('[MONTHLY_LETTER_ERROR]', result.error);
      return {
        success: false,
        error: result.error.message || 'Unknown Resend error',
      };
    }

    console.log(`[MONTHLY_LETTER_SUCCESS] Email ID: ${result.data?.id}`);

    return {
      success: true,
      emailId: result.data?.id,
    };
  } catch (error) {
    console.error('[MONTHLY_LETTER_ERROR]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Generate plain text version for email clients that don't support HTML
 */
function generatePlainTextFallback(params: MonthlyLetterParams): string {
  const { userName, companionName, monthSummary, month, year, diaryUrl } = params;
  const monthName = format(new Date(year, month - 1), 'MMMM yyyy');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://confide.app';

  const sections: string[] = [];

  // Greeting
  sections.push(`Hey ${userName},`);
  sections.push('');

  // Alex's note
  sections.push(monthSummary.alexNote);
  sections.push('');

  // Main themes
  if (monthSummary.mainThemes.length > 0) {
    sections.push('WHAT WE EXPLORED TOGETHER');
    monthSummary.mainThemes.forEach((theme) => sections.push(`• ${theme}`));
    sections.push('');
  }

  // Progress
  if (monthSummary.progress) {
    sections.push('I NOTICED THIS ABOUT YOU');
    sections.push(monthSummary.progress);
    sections.push('');
  }

  // What helped
  if (monthSummary.whatHelped.length > 0) {
    sections.push('WHAT HELPED');
    monthSummary.whatHelped.forEach((item) => sections.push(`• ${item}`));
    sections.push('');
  }

  // Goals
  if (monthSummary.goalsForNextMonth.length > 0) {
    sections.push('FOR NEXT MONTH');
    monthSummary.goalsForNextMonth.forEach((goal) => sections.push(`• ${goal}`));
    sections.push('');
  }

  // CTA
  if (diaryUrl) {
    sections.push(`Your diary for ${monthName} is ready: ${diaryUrl}`);
    sections.push('');
  }

  // Footer
  sections.push('---');
  sections.push(`Confide — ${companionName}`);
  sections.push(`Manage preferences: ${appUrl}/dashboard/settings`);
  sections.push(`Unsubscribe: ${appUrl}/unsubscribe`);

  return sections.join('\n');
}
