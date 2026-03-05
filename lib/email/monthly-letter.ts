// Confide Monthly Letter — HTML Email Generator
// Warm, personal monthly letter from Alex to the user

import { MonthSummary } from '@/types';
import { format } from 'date-fns';

// ============================================
// TYPES
// ============================================

export interface MonthlyLetterParams {
  userName: string;
  companionName: string;
  monthSummary: MonthSummary;
  month: number; // 1-12
  year: number;
  diaryUrl?: string; // Optional diary link
}

// ============================================
// MAIN GENERATOR
// ============================================

/**
 * Generate warm, personal monthly letter HTML
 * Design: Diary-style — cream background, serif fonts, circular icon, soft blocks
 */
export function generateMonthlyLetter(params: MonthlyLetterParams): string {
  const { userName, companionName, monthSummary, month, year, diaryUrl } = params;

  const monthName = format(new Date(year, month - 1), 'MMMM yyyy');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://confide.app';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Letter from ${companionName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #FEFCE8;">

  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEFCE8; padding: 48px 20px;">
    <tr>
      <td align="center">

        <!-- Email Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FEFCE8;">

          <!-- Circular Icon -->
          <tr>
            <td style="padding: 0 0 32px; text-align: center;">
              <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; background-color: rgba(224, 231, 255, 0.6); display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 56px; font-weight: 600; color: #6366F1; font-family: Georgia, serif;">C</span>
              </div>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 0 40px 24px; text-align: center;">
              <h1 style="margin: 0 0 12px; color: #1F2937; font-size: 42px; font-weight: 600; letter-spacing: -0.5px; font-family: Georgia, serif;">
                Your Letter
              </h1>
              <p style="margin: 0; color: #6366F1; font-size: 24px; font-weight: 400; font-family: Georgia, serif;">
                ${monthName}
              </p>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <p style="margin: 0; color: #9CA3AF; font-size: 16px; font-style: italic; font-family: Georgia, serif;">
                ${userName}'s reflections this month
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="height: 1px; background-color: rgba(99, 102, 241, 0.2);"></div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 0 40px 32px;">

              <!-- Greeting -->
              <p style="margin: 0 0 28px; color: #1F2937; font-size: 17px; line-height: 1.8; font-family: Georgia, serif;">
                Hey ${userName},
              </p>

              <!-- Alex's Personal Note (highlighted block) -->
              <div style="margin: 0 0 40px; padding: 24px; background-color: rgba(254, 243, 199, 0.5); border-radius: 12px; border-left: 3px solid #F59E0B;">
                <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.9; font-style: italic; font-family: Georgia, serif;">
                  ${monthSummary.alexNote}
                </p>
              </div>

              <!-- Main Themes -->
              ${
                monthSummary.mainThemes.length > 0
                  ? `
              <div style="margin: 0 0 36px;">
                <h2 style="margin: 0 0 20px; color: #1F2937; font-size: 24px; font-weight: 600; font-family: Georgia, serif;">
                  What we explored together
                </h2>
                <div style="color: #4B5563; font-size: 15px; line-height: 2; font-family: Georgia, serif;">
                  ${monthSummary.mainThemes.map((theme) => `<div style="margin-bottom: 10px;"><span style="color: #6366F1; margin-right: 8px;">~</span>${theme}</div>`).join('')}
                </div>
              </div>
              `
                  : ''
              }

              <!-- Progress (soft blue block) -->
              ${
                monthSummary.progress
                  ? `
              <div style="margin: 0 0 36px;">
                <h2 style="margin: 0 0 20px; color: #1F2937; font-size: 24px; font-weight: 600; font-family: Georgia, serif;">
                  Progress
                </h2>
                <div style="padding: 24px; background-color: rgba(224, 231, 255, 0.4); border-radius: 12px;">
                  <p style="margin: 0; color: #4B5563; font-size: 15px; line-height: 1.9; font-family: Georgia, serif;">
                    ${monthSummary.progress}
                  </p>
                </div>
              </div>
              `
                  : ''
              }

              <!-- What Helped -->
              ${
                monthSummary.whatHelped.length > 0
                  ? `
              <div style="margin: 0 0 36px;">
                <h2 style="margin: 0 0 20px; color: #1F2937; font-size: 24px; font-weight: 600; font-family: Georgia, serif;">
                  What Helped
                </h2>
                <div style="color: #4B5563; font-size: 15px; line-height: 2; font-family: Georgia, serif;">
                  ${monthSummary.whatHelped.map((item) => `<div style="margin-bottom: 10px;"><span style="color: #10B981; margin-right: 8px;">~</span>${item}</div>`).join('')}
                </div>
              </div>
              `
                  : ''
              }

              <!-- Goals for Next Month -->
              ${
                monthSummary.goalsForNextMonth.length > 0
                  ? `
              <div style="margin: 0 0 40px;">
                <h2 style="margin: 0 0 20px; color: #1F2937; font-size: 24px; font-weight: 600; font-family: Georgia, serif;">
                  Looking Ahead
                </h2>
                <div style="color: #4B5563; font-size: 15px; line-height: 2; font-family: Georgia, serif;">
                  ${monthSummary.goalsForNextMonth.map((goal) => `<div style="margin-bottom: 10px;"><span style="color: #F59E0B; margin-right: 8px;">></span>${goal}</div>`).join('')}
                </div>
              </div>
              `
                  : ''
              }

              <!-- Divider before CTA -->
              ${
                diaryUrl
                  ? `
              <div style="margin: 40px 0; height: 1px; background-color: rgba(99, 102, 241, 0.2);"></div>

              <!-- CTA -->
              <div style="margin: 40px 0 0; text-align: center;">
                <p style="margin: 0 0 20px; color: #6B7280; font-size: 15px; font-family: Georgia, serif;">
                  Your diary for ${monthName} is ready
                </p>
                <a href="${diaryUrl}" style="display: inline-block; padding: 16px 40px; background-color: #6366F1; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                  View My Diary
                </a>
              </div>
              `
                  : ''
              }

            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center;">
              <p style="margin: 0 0 8px; color: #9CA3AF; font-size: 15px; font-style: italic; font-family: Georgia, serif;">
                With care,
              </p>
              <p style="margin: 0; color: #6366F1; font-size: 22px; font-weight: 600; font-family: Georgia, serif;">
                ${companionName}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-top: 1px solid rgba(99, 102, 241, 0.1);">
              <p style="margin: 0 0 8px; color: #9CA3AF; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                This is your monthly reflection from Confide
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                <a href="${appUrl}/dashboard/settings" style="color: #6366F1; text-decoration: none;">Manage preferences</a>
                &nbsp;•&nbsp;
                <a href="${appUrl}/unsubscribe" style="color: #6366F1; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}
