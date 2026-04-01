'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PLAN_DETAILS, type PaddlePlan } from '@/lib/billing/paddle'

// ── Types ──────────────────────────────────────────────────

interface SettingsData {
  email: string
  preferredName: string
  plan: string
  trialStatus: 'active' | 'expired' | 'subscribed' | 'none'
  trialDaysRemaining: number
  profile: {
    targetScore: number | null
    testDate: string | null
    studyHoursPerWeek: number | null
    weakTopics: string[]
    learningStyle: string | null
  }
  subscription: {
    status: string | null
    plan: string | null
    paddleCustomerId: string | null
    expiresAt: string | null
  } | null
}

interface SettingsClientProps {
  initial: SettingsData
}

// ── Section Label Helpers ──────────────────────────────────

const WEAK_SECTION_OPTIONS = [
  { value: 'quant', label: 'Quantitative' },
  { value: 'verbal', label: 'Verbal' },
  { value: 'data-insights', label: 'Data Insights' },
] as const

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

// ── Component ──────────────────────────────────────────────

export default function SettingsClient({ initial }: SettingsClientProps) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(initial.preferredName || '')
  const [targetScore, setTargetScore] = useState<string>(
    initial.profile.targetScore?.toString() || ''
  )
  const [testDate, setTestDate] = useState(formatDate(initial.profile.testDate))
  const [studyHours, setStudyHours] = useState<string>(
    initial.profile.studyHoursPerWeek?.toString() || ''
  )
  const [weakSections, setWeakSections] = useState<string[]>(
    initial.profile.weakTopics || []
  )

  function toggleWeakSection(value: string) {
    setWeakSections((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  function handleCancel() {
    setName(initial.preferredName || '')
    setTargetScore(initial.profile.targetScore?.toString() || '')
    setTestDate(formatDate(initial.profile.testDate))
    setStudyHours(initial.profile.studyHoursPerWeek?.toString() || '')
    setWeakSections(initial.profile.weakTopics || [])
    setEditing(false)
    setError(null)
  }

  function handleSave() {
    setError(null)
    setSaved(false)

    const scoreNum = targetScore ? parseInt(targetScore, 10) : null
    if (scoreNum !== null && (scoreNum < 205 || scoreNum > 805)) {
      setError('Target score must be between 205 and 805')
      return
    }

    const hoursNum = studyHours ? parseInt(studyHours, 10) : null
    if (hoursNum !== null && (hoursNum < 1 || hoursNum > 40)) {
      setError('Study hours must be between 1 and 40')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferredName: name || undefined,
            targetScore: scoreNum,
            testDate: testDate || null,
            studyHoursPerWeek: hoursNum,
            weakSections,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Failed to save')
          return
        }

        setSaved(true)
        setEditing(false)
        setTimeout(() => setSaved(false), 3000)
      } catch {
        setError('Network error — please try again')
      }
    })
  }

  const planLabel = initial.subscription?.plan || initial.plan || 'free'
  const planDetails = PLAN_DETAILS[planLabel as PaddlePlan]

  return (
    <div className="min-h-full max-w-3xl mx-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your SamiWISE account and preferences</p>
        </div>
        {saved && (
          <span className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            ✓ Saved
          </span>
        )}
      </div>

      {/* ── Account ──────────────────────────────────────── */}
      <Card className="bg-[#151C2C]/80 border-white/[0.06] backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white">Account</CardTitle>
            <CardDescription className="text-slate-400">Your profile information</CardDescription>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email — always read-only */}
          <div>
            <label className="text-sm font-medium text-slate-300">Email</label>
            <p className="text-sm text-slate-500 mt-1">{initial.email}</p>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-slate-300">Display Name</label>
            {editing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="mt-1 w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                  placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30
                  transition-colors"
                placeholder="Your name"
              />
            ) : (
              <p className="text-sm text-slate-500 mt-1">{name || 'Not set'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── GMAT Profile ────────────────────────────────── */}
      <Card className="bg-[#151C2C]/80 border-white/[0.06] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-white">GMAT Profile</CardTitle>
          <CardDescription className="text-slate-400">Your learning preferences and goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Target Score */}
            <div>
              <label className="text-sm font-medium text-slate-300">Target Score</label>
              {editing ? (
                <input
                  type="number"
                  min={205}
                  max={805}
                  step={10}
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className="mt-1 w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                    placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30
                    transition-colors"
                  placeholder="205–805"
                />
              ) : (
                <p className="text-sm text-slate-500 mt-1">
                  {targetScore || 'Not set'}
                </p>
              )}
            </div>

            {/* Study Hours */}
            <div>
              <label className="text-sm font-medium text-slate-300">Study Hours / Week</label>
              {editing ? (
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  className="mt-1 w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                    placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30
                    transition-colors"
                  placeholder="1–40"
                />
              ) : (
                <p className="text-sm text-slate-500 mt-1">
                  {studyHours ? `${studyHours}h` : 'Not set'}
                </p>
              )}
            </div>

            {/* Test Date */}
            <div>
              <label className="text-sm font-medium text-slate-300">Test Date</label>
              {editing ? (
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                    placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30
                    transition-colors [color-scheme:dark]"
                />
              ) : (
                <p className="text-sm text-slate-500 mt-1">
                  {testDate || 'Flexible'}
                </p>
              )}
            </div>

            {/* Learning Style — read-only always */}
            <div>
              <label className="text-sm font-medium text-slate-300">Learning Style</label>
              <p className="text-sm text-slate-500 mt-1">
                {initial.profile.learningStyle || 'Sam is still learning yours'}
              </p>
            </div>
          </div>

          {/* Weak Sections */}
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Focus Areas</label>
            {editing ? (
              <div className="flex flex-wrap gap-3">
                {WEAK_SECTION_OPTIONS.map((opt) => {
                  const active = weakSections.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleWeakSection(opt.value)}
                      className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                        active
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                          : 'bg-[#0B1120] border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400'
                      }`}
                    >
                      {active && <span className="mr-1.5">✓</span>}
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {weakSections.length > 0 ? (
                  weakSections.map((s) => {
                    const label = WEAK_SECTION_OPTIONS.find((o) => o.value === s)?.label || s
                    return (
                      <span
                        key={s}
                        className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-full"
                      >
                        {label}
                      </span>
                    )
                  })
                ) : (
                  <p className="text-sm text-slate-500">None selected</p>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          {editing && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500 text-white hover:bg-cyan-400
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-slate-300
                  transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Subscription ────────────────────────────────── */}
      <Card className="bg-[#151C2C]/80 border-white/[0.06] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-white">Subscription</CardTitle>
          <CardDescription className="text-slate-400">Your plan and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current plan */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Current Plan</p>
              <p className="text-sm text-white capitalize mt-0.5 font-medium">
                {planDetails?.name || planLabel}
                {planDetails && (
                  <span className="text-slate-500 font-normal ml-1">
                    — ${planDetails.price}/{planDetails.period}
                  </span>
                )}
              </p>
            </div>
            {planLabel === 'free' && (
              <a
                href="/#pricing"
                className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Upgrade →
              </a>
            )}
          </div>

          {/* Trial status — active */}
          {initial.trialStatus === 'active' && (
            <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-400">
                    Free Trial — {initial.trialDaysRemaining} day
                    {initial.trialDaysRemaining !== 1 ? 's' : ''} remaining
                  </p>
                  <p className="text-xs text-cyan-400/60 mt-0.5">
                    Full access to all features
                  </p>
                </div>
                <a
                  href="/#pricing"
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/30
                    px-3 py-1.5 rounded-lg transition-colors"
                >
                  Upgrade Now
                </a>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-cyan-500/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${Math.max(5, ((7 - initial.trialDaysRemaining) / 7) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Trial expired */}
          {initial.trialStatus === 'expired' && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-sm font-medium text-red-400">Trial Expired</p>
              <p className="text-xs text-red-400/60 mt-0.5">
                Subscribe to restore full access.
              </p>
              <a
                href="/#pricing"
                className="text-xs text-red-400 hover:text-red-300 font-semibold mt-2 inline-block"
              >
                View Plans →
              </a>
            </div>
          )}

          {/* Subscribed — show status + billing */}
          {initial.trialStatus === 'subscribed' && initial.subscription && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-300">Status</p>
                  <p className="text-sm mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1.5 ${
                        initial.subscription.status === 'active'
                          ? 'text-emerald-400'
                          : initial.subscription.status === 'cancelled'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          initial.subscription.status === 'active'
                            ? 'bg-emerald-400'
                            : initial.subscription.status === 'cancelled'
                              ? 'bg-amber-400'
                              : 'bg-slate-400'
                        }`}
                      />
                      {initial.subscription.status === 'active'
                        ? 'Active'
                        : initial.subscription.status === 'cancelled'
                          ? 'Cancelled'
                          : (initial.subscription.status ?? 'Unknown')}
                    </span>
                  </p>
                </div>
                {initial.subscription.expiresAt && (
                  <div>
                    <p className="text-sm font-medium text-slate-300">Next Billing</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {new Date(initial.subscription.expiresAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Manage subscription */}
              <div className="pt-1">
                <a
                  href="https://customer-portal.paddle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white border border-white/10
                    hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Manage Subscription
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </>
          )}

          {/* Plan features — only show for paid plans */}
          {planDetails && planLabel !== 'free' && (
            <div className="pt-2 border-t border-white/[0.06]">
              <p className="text-sm font-medium text-slate-300 mb-2">Included features</p>
              <ul className="space-y-1.5">
                {planDetails.features.map((f, i) => (
                  <li key={i} className="text-sm text-slate-500 flex items-center gap-2">
                    <span className="text-cyan-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── About Sam ───────────────────────────────────── */}
      <Card className="bg-[#151C2C]/80 border-white/[0.06] backdrop-blur-sm">
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
            <span className="block mt-1">
              Explain concepts, practice problems, track weak areas, adapt difficulty, remember
              progress.
            </span>
          </div>
          <div className="text-sm text-slate-400">
            <strong className="text-slate-300">What Sam cannot do:</strong>
            <span className="block mt-1">
              Guarantee a score, replace a structured course, or provide official test access.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
