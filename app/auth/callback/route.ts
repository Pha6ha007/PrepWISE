import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * OAuth callback handler — Google Sign-in via Supabase
 *
 * Flow:
 * 1. User clicks "Continue with Google" on login/register
 * 2. Supabase redirects to Google OAuth consent screen
 * 3. Google redirects back to Supabase
 * 4. Supabase redirects here with ?code=xxx
 * 5. We exchange the code for a session
 * 6. Redirect to onboarding (new user) or dashboard (existing user)
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const plan = requestUrl.searchParams.get('plan')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Cookie errors in server components are expected
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('OAuth callback error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    if (data.user) {
      // Check if user has completed onboarding
      // Look for gmat_profile or any user record in our DB
      try {
        const { data: dbUser } = await supabase
          .from('users')
          .select('gmat_profile, first_name, trial_start_date, trial_end_date')
          .eq('id', data.user.id)
          .single()

        // New user or no profile → onboarding
        if (!dbUser || !dbUser.first_name) {
          // Set trial dates for brand-new users via Prisma
          try {
            const { createTrialDates } = await import('@/lib/billing/trial')
            const { trialStartDate, trialEndDate } = createTrialDates()
            const { prisma } = await import('@/lib/prisma')

            await prisma.user.upsert({
              where: { id: data.user.id },
              create: {
                id: data.user.id,
                email: data.user.email!,
                plan: 'free',
                trialStartDate,
                trialEndDate,
              },
              update: {
                // Only set trial dates if not already set
                ...(dbUser?.trial_start_date ? {} : { trialStartDate }),
                ...(dbUser?.trial_end_date ? {} : { trialEndDate }),
              },
            })
          } catch (trialErr) {
            console.error('Failed to set trial dates:', trialErr)
            // Non-blocking — onboarding will also set trial dates
          }

          const onboardingUrl = plan
            ? `${origin}/onboarding?plan=${plan}`
            : `${origin}/onboarding`
          return NextResponse.redirect(onboardingUrl)
        }
      } catch {
        // No DB connection or table — send to onboarding as safe default
        const onboardingUrl = plan
          ? `${origin}/onboarding?plan=${plan}`
          : `${origin}/onboarding`
        return NextResponse.redirect(onboardingUrl)
      }
    }
  }

  // Existing user → dashboard
  const dashboardUrl = plan
    ? `${origin}/dashboard/session?checkout=${plan}`
    : `${origin}/dashboard/session`
  return NextResponse.redirect(dashboardUrl)
}
