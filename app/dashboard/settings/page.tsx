import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const preferredName = dbUser?.preferredName || 'Not set'
  const plan = dbUser?.plan || 'free'

  const trialStatus = getTrialStatus({
    trialStartDate: dbUser?.trialStartDate,
    trialEndDate: dbUser?.trialEndDate,
    plan,
  })
  const trialDaysRemaining = getTrialDaysRemaining({ trialEndDate: dbUser?.trialEndDate })

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your Prepwise account and preferences</p>
      </div>

      {/* Account */}
      <Card className="bg-[#151C2C]/80 border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-xl text-white">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-300">Email</p>
            <p className="text-sm text-slate-500">{email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">Display name</p>
            <p className="text-sm text-slate-500">{preferredName}</p>
          </div>
        </CardContent>
      </Card>

      {/* GMAT Profile */}
      <Card className="bg-[#151C2C]/80 border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-xl text-white">GMAT Profile</CardTitle>
          <CardDescription className="text-slate-400">Your learning preferences and goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-300">Target score</p>
              <p className="text-sm text-slate-500">{profile?.targetScore || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Study hours/week</p>
              <p className="text-sm text-slate-500">{profile?.studyHoursPerWeek ? `${profile.studyHoursPerWeek}h` : 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Test date</p>
              <p className="text-sm text-slate-500">{profile?.testDate || 'Flexible'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Learning style</p>
              <p className="text-sm text-slate-500">{profile?.learningStyle || 'Sam is still learning yours'}</p>
            </div>
          </div>

          {profile?.weakTopics?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">Focus areas</p>
              <div className="flex flex-wrap gap-2">
                {profile.weakTopics.map((topic: string) => (
                  <span key={topic} className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="bg-[#151C2C]/80 border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-xl text-white">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Current plan</p>
              <p className="text-sm text-slate-500 capitalize">{plan}</p>
            </div>
            {plan === 'free' && (
              <a href="/#pricing" className="text-sm text-cyan-400 hover:text-cyan-300">Upgrade →</a>
            )}
          </div>
          {/* Trial status */}
          {trialStatus === 'active' && (
            <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-4 py-3">
              <p className="text-sm font-medium text-cyan-400">
                Free Trial — {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining
              </p>
              <p className="text-xs text-cyan-400/60 mt-0.5">Full access to all features</p>
            </div>
          )}
          {trialStatus === 'expired' && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-sm font-medium text-red-400">Trial Expired</p>
              <p className="text-xs text-red-400/60 mt-0.5">
                Subscribe to restore full access.
              </p>
              <a href="/#pricing" className="text-xs text-red-400 hover:text-red-300 font-semibold mt-1 inline-block">
                View plans →
              </a>
            </div>
          )}
          {subscription?.status && (
            <div>
              <p className="text-sm font-medium text-slate-300">Status</p>
              <p className="text-sm text-slate-500 capitalize">{subscription.status}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* About Sam */}
      <Card className="bg-[#151C2C]/80 border-white/[0.06]">
        <CardHeader>
          <CardTitle className="text-xl text-white">About Sam</CardTitle>
          <CardDescription className="text-slate-400">Your AI GMAT tutor</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Sam is an AI tutor — not a human instructor. Sam uses AI to explain GMAT concepts,
            track your progress, and adapt to your learning style.
          </p>
          <div className="text-sm text-slate-400 mb-3">
            <strong className="text-slate-300">What Sam can do:</strong>
            <span className="block mt-1">Explain concepts, practice problems, track weak areas, adapt difficulty, remember progress.</span>
          </div>
          <div className="text-sm text-slate-400">
            <strong className="text-slate-300">What Sam cannot do:</strong>
            <span className="block mt-1">Guarantee a score, replace a structured course, or provide official test access.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
