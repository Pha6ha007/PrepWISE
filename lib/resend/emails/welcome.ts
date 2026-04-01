import { resend, FROM_EMAIL } from '../client'

interface WelcomeEmailParams {
  preferredName: string
  companionName: string
  email: string
}

/**
 * Отправляет Welcome email после завершения онбординга
 * Fire-and-forget (не блокирует основной поток)
 */
export async function sendWelcomeEmail({
  preferredName,
  companionName,
  email,
}: WelcomeEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const { data, error } = await resend.emails.send({
      from: `SamiWISE <${FROM_EMAIL}>`,
      to: email,
      subject: `Welcome to SamiWISE — ${companionName} is ready for you`,
      html: getWelcomeEmailHTML({
        preferredName,
        companionName,
        appUrl,
      }),
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error }
    }

    console.log('Welcome email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error }
  }
}

function getWelcomeEmailHTML({
  preferredName,
  companionName,
  appUrl,
}: {
  preferredName: string
  companionName: string
  appUrl: string
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SamiWISE</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FAFAF9;">

  <!-- Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAF9; padding: 40px 20px;">
    <tr>
      <td align="center">

        <!-- Email Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Gradient Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%); padding: 50px 40px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 600;">
                Welcome to SamiWISE
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">

              <!-- Greeting -->
              <h2 style="margin: 0 0 20px; color: #1F2937; font-size: 24px; font-weight: 600;">
                Hi ${preferredName}!
              </h2>

              <!-- Main Message -->
              <p style="margin: 0 0 20px; color: #4B5563; font-size: 16px; line-height: 1.6;">
                <strong style="color: #6366F1;">${companionName}</strong> is here whenever you need to talk.
              </p>

              <p style="margin: 0 0 30px; color: #4B5563; font-size: 16px; line-height: 1.6;">
                No judgment, no rush — just a safe space to share what's on your mind.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${appUrl}/dashboard/chat"
                       style="display: inline-block;
                              padding: 16px 36px;
                              background-color: #6366F1;
                              color: #FFFFFF;
                              text-decoration: none;
                              border-radius: 8px;
                              font-size: 16px;
                              font-weight: 600;
                              box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);">
                      Start talking with ${companionName}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px 40px; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px; color: #9CA3AF; font-size: 12px; line-height: 1.5; text-align: center;">
                <strong>Disclaimer:</strong> SamiWISE is an AI companion for emotional support,
                not a replacement for professional mental health care.
                If you're experiencing a crisis, please contact emergency services
                or a mental health professional.
              </p>
              <p style="margin: 10px 0 0; color: #9CA3AF; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} SamiWISE. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}
