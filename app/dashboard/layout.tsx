import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

async function signOut() {
  'use server'
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {}
  redirect('/login')
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Try Supabase auth — gracefully degrade if not configured
  let user = null
  let userPlan = 'free'
  let trialData: { trialStartDate: Date | null; trialEndDate: Date | null } = {
    trialStartDate: null,
    trialEndDate: null,
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user

    if (!user) {
      redirect('/login')
    }

    // Get user plan and trial data from DB
    try {
      const { prisma } = await import('@/lib/prisma')
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { plan: true, trialStartDate: true, trialEndDate: true },
      })
      userPlan = dbUser?.plan || 'free'
      trialData = {
        trialStartDate: dbUser?.trialStartDate ?? null,
        trialEndDate: dbUser?.trialEndDate ?? null,
      }
    } catch {
      // DB not connected — use default
    }
  } catch (error: any) {
    // Supabase not configured — allow access in dev mode
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error // re-throw redirect
    }
    console.warn('Dashboard: Supabase not configured, allowing access in dev mode')
    user = { id: 'dev-user', email: 'dev@prepwise.app' } as any
  }

  return (
    <DashboardClient
      user={user!}
      userPlan={userPlan}
      trialEndDate={trialData.trialEndDate?.toISOString() ?? null}
      trialStartDate={trialData.trialStartDate?.toISOString() ?? null}
      signOut={signOut}
    >
      {children}
    </DashboardClient>
  )
}
