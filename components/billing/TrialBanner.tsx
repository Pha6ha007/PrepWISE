'use client'

import Link from 'next/link'
import { Clock, AlertTriangle, Zap } from 'lucide-react'
import { getTrialStatus, getTrialDaysRemaining } from '@/lib/billing/trial'

interface TrialBannerProps {
  trialStartDate: string | null
  trialEndDate: string | null
  plan: string
}

export function TrialBanner({ trialStartDate, trialEndDate, plan }: TrialBannerProps) {
  const user = {
    trialStartDate: trialStartDate ? new Date(trialStartDate) : null,
    trialEndDate: trialEndDate ? new Date(trialEndDate) : null,
    plan,
  }

  const status = getTrialStatus(user)
  const daysRemaining = getTrialDaysRemaining(user)

  if (status === 'subscribed' || status === 'none') return null

  if (status === 'expired') {
    return (
      <div className="mx-3 mb-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
        <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Trial ended</span>
        </div>
        <p className="text-xs text-red-400/70 mt-1 ml-6">
          Subscribe to continue full access.
        </p>
        <Link
          href="/#pricing"
          className="mt-2 ml-6 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500/80 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Zap className="w-3 h-3" />
          Upgrade now
        </Link>
      </div>
    )
  }

  // Active trial
  const isExpiringSoon = daysRemaining <= 2
  const accentClass = isExpiringSoon
    ? 'bg-amber-500/10 border-amber-500/20'
    : 'bg-cyan-500/10 border-cyan-500/20'
  const textClass = isExpiringSoon ? 'text-amber-400' : 'text-cyan-400'
  const subtextClass = isExpiringSoon ? 'text-amber-400/70' : 'text-cyan-400/70'
  const IconComponent = isExpiringSoon ? AlertTriangle : Clock

  return (
    <div className={`mx-3 mb-2 rounded-xl border p-3 ${accentClass}`}>
      <div className={`flex items-center gap-2 text-sm font-medium ${textClass}`}>
        <IconComponent className="w-4 h-4 flex-shrink-0" />
        <span>
          Free Trial: {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
        </span>
      </div>
      <p className={`text-xs mt-1 ml-6 ${subtextClass}`}>
        {isExpiringSoon
          ? 'Your trial is ending soon — upgrade to keep full access.'
          : 'Full access to all features.'}
      </p>
      <Link
        href="/#pricing"
        className={`mt-2 ml-6 inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors ${
          isExpiringSoon
            ? 'bg-amber-500/80 hover:bg-amber-500'
            : 'bg-cyan-500/80 hover:bg-cyan-500'
        }`}
      >
        <Zap className="w-3 h-3" />
        Upgrade
      </Link>
    </div>
  )
}
