'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Brain,
  BookOpen,
  TrendingUp,
  Settings,
  LogOut,
  Crown,
  Target,
  Menu,
  X,
  Mic,
  Calendar,
  CalendarDays,
  FileText,
  Layers,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { TrialBanner } from '@/components/billing/TrialBanner'
import { getTrialStatus, getTrialDaysRemaining } from '@/lib/billing/trial'
import { StreakRing } from '@/components/gamification/StreakRing'
import { calculateStreak } from '@/lib/gmat/gamification'
import { QuestionOfTheDay } from '@/components/dashboard/QuestionOfTheDay'
import { PreExamBanner } from '@/components/dashboard/PreExamBanner'
import { isPreExamMode } from '@/lib/gmat/pre-exam'

interface DashboardClientProps {
  user: User
  userPlan: string
  trialStartDate: string | null
  trialEndDate: string | null
  studyDates?: string[]       // YYYY-MM-DD dates the user studied
  gmatTestDate?: string | null     // ISO date string from learner profile
  gmatWeakTopics?: string[]        // weak topics from learner profile
  signOut: () => Promise<void>
  children: React.ReactNode
}

const navigation = [
  { name: 'Session', href: '/dashboard/session', icon: Mic },
  { name: 'Practice', href: '/dashboard/practice', icon: BookOpen },
  { name: 'Study Plan', href: '/dashboard/study-plan', icon: CalendarDays },
  { name: 'Journal', href: '/dashboard/journal', icon: Calendar },
  { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
  { name: 'Mock Test', href: '/dashboard/mock-test', icon: Target },
  { name: 'Formulas', href: '/dashboard/formulas', icon: FileText },
  { name: 'Flashcards', href: '/dashboard/flashcards', icon: Layers },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardClient({
  user,
  userPlan,
  trialStartDate,
  trialEndDate,
  studyDates = [],
  gmatTestDate = null,
  gmatWeakTopics = [],
  signOut,
  children,
}: DashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const currentPath = usePathname()
  const streakData = useMemo(() => calculateStreak(studyDates), [studyDates])
  const showPreExamBanner = useMemo(() => isPreExamMode(gmatTestDate), [gmatTestDate])

  return (
    <div className="h-screen flex bg-[#0B1120]">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-64 h-screen
          bg-[#0B1120] border-r border-white/[0.04]
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo — fixed, never scrolls away */}
          <div className="flex-shrink-0 px-6 py-5 border-b border-white/[0.04] flex items-center justify-between">
            <Link href="/dashboard/session" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#0B1120]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">SamiWISE</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation — scrollable if needed, takes all available space */}
          <nav className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Bottom widgets — always visible, pinned to bottom */}
          <div className="flex-shrink-0 border-t border-white/[0.04]">
            {/* Streak Ring */}
            <div className="px-3 py-2">
              <StreakRing streak={streakData} size={80} />
            </div>

            {/* Trial banner */}
            <TrialBanner
              trialStartDate={trialStartDate}
              trialEndDate={trialEndDate}
              plan={userPlan}
            />

            {/* Plan badge + sign out */}
            <div className="px-3 py-3 space-y-2">
              <div className="px-3 py-2 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300 capitalize">
                    {(() => {
                      const status = getTrialStatus({
                        trialStartDate: trialStartDate ? new Date(trialStartDate) : null,
                        trialEndDate: trialEndDate ? new Date(trialEndDate) : null,
                        plan: userPlan,
                      })
                      if (status === 'active') {
                        const days = getTrialDaysRemaining({ trialEndDate: trialEndDate ? new Date(trialEndDate) : null })
                        return `Trial · ${days}d left`
                      }
                      return `${userPlan} plan`
                    })()}
                  </span>
                </div>
                {userPlan === 'free' && (
                  <Link
                    href="/#pricing"
                    className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 block"
                  >
                    Upgrade for unlimited sessions →
                  </Link>
                )}
              </div>
              {/* Help & Links */}
              <div className="flex items-center gap-3 px-3">
                <Link href="/contact" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  Contact
                </Link>
                <Link href="/resources" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  Resources
                </Link>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.03] bg-[#0B1120]">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Brain className="w-3 h-3 text-[#0B1120]" />
            </div>
            <span className="font-semibold text-white">SamiWISE</span>
          </div>
          <div className="w-6" />
        </div>

        <main className="flex-1 overflow-auto relative bg-[#0B1120]">
          {showPreExamBanner && gmatTestDate && (
            <PreExamBanner
              testDate={gmatTestDate}
              weakTopics={gmatWeakTopics}
            />
          )}
          <div className="min-h-full bg-[#0B1120]">{children}</div>
        </main>
      </div>
    </div>
  )
}
