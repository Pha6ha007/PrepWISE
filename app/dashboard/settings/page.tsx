import SettingsClient from '@/components/settings/SettingsClient'
import { getTrialStatus, getTrialDaysRemaining } from '@/lib/billing/trial'

export default async function SettingsPage() {
  let dbUser: any = null
  let profile: any = null
  let subscription: any = null

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { prisma } = await import('@/lib/prisma')
      dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { subscription: true },
      })
      profile = dbUser?.gmatProfile || null
      subscription = dbUser?.subscription || null
    }
  } catch {
    // Supabase/DB not configured
  }

  const email = dbUser?.email || 'Not connected'
  const preferredName = dbUser?.preferredName || ''
  const plan = dbUser?.plan || 'free'

  const trialStatus = getTrialStatus({
    trialStartDate: dbUser?.trialStartDate,
    trialEndDate: dbUser?.trialEndDate,
    plan,
  })
  const trialDaysRemaining = getTrialDaysRemaining({ trialEndDate: dbUser?.trialEndDate })

  return (
    <SettingsClient
      initial={{
        email,
        preferredName,
        plan,
        trialStatus,
        trialDaysRemaining,
        profile: {
          targetScore: profile?.targetScore ?? null,
          testDate: profile?.testDate ?? null,
          studyHoursPerWeek: profile?.studyHoursPerWeek ?? null,
          weakTopics: profile?.weakTopics ?? [],
          learningStyle: profile?.learningStyle ?? null,
        },
        subscription: subscription
          ? {
              status: subscription.status,
              plan: subscription.plan,
              paddleCustomerId: subscription.paddleCustomerId ?? null,
              expiresAt: subscription.expiresAt?.toISOString() ?? null,
            }
          : null,
      }}
    />
  )
}
