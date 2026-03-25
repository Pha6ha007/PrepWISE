'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock,
  Target,
  BookOpen,
  Dumbbell,
  RefreshCw,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  Trophy,
} from 'lucide-react'
import type { StudyPlan, WeekPlan, DayPlan } from '@/lib/gmat/study-plan'
import { GMAT_TOPICS, GMAT_SECTIONS } from '@/lib/gmat/topics'

// ── Setup Form ────────────────────────────────────────────────

interface SetupFormProps {
  onGenerate: (config: {
    targetScore: number
    testDate: string
    hoursPerWeek: number
    weakSections: string[]
    weakTopics: string[]
  }) => void
  isLoading: boolean
}

function SetupForm({ onGenerate, isLoading }: SetupFormProps) {
  const [targetScore, setTargetScore] = useState(655)
  const [testDate, setTestDate] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState(15)
  const [weakSections, setWeakSections] = useState<string[]>([])
  const [weakTopics, setWeakTopics] = useState<string[]>([])

  // Default test date to ~10 weeks from now
  useEffect(() => {
    const d = new Date()
    d.setDate(d.getDate() + 70)
    setTestDate(d.toISOString().split('T')[0])
  }, [])

  const toggleSection = (id: string) => {
    setWeakSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const toggleTopic = (id: string) => {
    setWeakTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (weakSections.length === 0) return
    onGenerate({ targetScore, testDate, hoursPerWeek, weakSections, weakTopics })
  }

  // Filtered topics for selected weak sections
  const relevantTopics = GMAT_TOPICS.filter(t => weakSections.includes(t.section))

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="w-6 h-6 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Create Your Study Plan</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Get a personalized week-by-week plan based on your goals, timeline, and weak areas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Target Score */}
        <div className="glass-card p-5">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            <Target className="w-4 h-4 inline mr-2 text-cyan-400" />
            Target Score
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={505}
              max={805}
              step={10}
              value={targetScore}
              onChange={e => setTargetScore(Number(e.target.value))}
              className="flex-1 accent-cyan-500 h-2 bg-[#151C2C] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="text-xl font-bold text-cyan-400 w-14 text-right tabular-nums">{targetScore}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>505</span>
            <span>805</span>
          </div>
        </div>

        {/* Test Date */}
        <div className="glass-card p-5">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            <CalendarDays className="w-4 h-4 inline mr-2 text-cyan-400" />
            Test Date
          </label>
          <input
            type="date"
            value={testDate}
            onChange={e => setTestDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-[#151C2C] border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm
              focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25
              [color-scheme:dark]"
          />
        </div>

        {/* Hours Per Week */}
        <div className="glass-card p-5">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            <Clock className="w-4 h-4 inline mr-2 text-cyan-400" />
            Study Hours Per Week
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={hoursPerWeek}
              onChange={e => setHoursPerWeek(Number(e.target.value))}
              className="flex-1 accent-cyan-500 h-2 bg-[#151C2C] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="text-xl font-bold text-cyan-400 w-20 text-right tabular-nums">{hoursPerWeek} hrs</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>5 hrs</span>
            <span>30 hrs</span>
          </div>
        </div>

        {/* Weak Sections */}
        <div className="glass-card p-5">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            <Dumbbell className="w-4 h-4 inline mr-2 text-cyan-400" />
            Weak Sections <span className="text-slate-500">(select at least one)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GMAT_SECTIONS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSection(s.id)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                  weakSections.includes(s.id)
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04]'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Weak Topics (if sections selected) */}
        {relevantTopics.length > 0 && (
          <div className="glass-card p-5">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              <BookOpen className="w-4 h-4 inline mr-2 text-cyan-400" />
              Specific Weak Topics <span className="text-slate-500">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {relevantTopics.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTopic(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    weakTopics.includes(t.id)
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={weakSections.length === 0 || isLoading}
          className="w-full py-3 rounded-xl font-medium text-sm transition-all
            bg-gradient-to-r from-cyan-500 to-cyan-600 text-white
            hover:from-cyan-400 hover:to-cyan-500
            disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Study Plan
            </>
          )}
        </button>
      </form>
    </div>
  )
}

// ── Activity Badge ─────────────────────────────────────────────

const ACTIVITY_COLORS: Record<DayPlan['activity'], string> = {
  lesson: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  practice: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'mock-test': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  rest: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
}

function ActivityBadge({ activity }: { activity: DayPlan['activity'] }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${ACTIVITY_COLORS[activity]}`}>
      {activity === 'mock-test' ? 'Mock' : activity}
    </span>
  )
}

// ── Section Color ────────────────────────────────────────────

function sectionColor(section: string): string {
  switch (section) {
    case 'quant': return 'text-cyan-400'
    case 'verbal': return 'text-emerald-400'
    case 'data-insights': return 'text-amber-400'
    default: return 'text-slate-400'
  }
}

// ── Week Card ────────────────────────────────────────────────

interface WeekCardProps {
  week: WeekPlan
  isCurrentWeek: boolean
  completedDays: string[]
  onToggleDay: (dayKey: string) => void
}

function WeekCard({ week, isCurrentWeek, completedDays, onToggleDay }: WeekCardProps) {
  const [expanded, setExpanded] = useState(isCurrentWeek)

  const completedCount = week.topics.filter(d => {
    if (d.activity === 'rest') return true
    return completedDays.includes(`week-${week.week}-${d.day}`)
  }).length

  const totalDays = week.topics.length
  const progressPct = Math.round((completedCount / totalDays) * 100)

  return (
    <div className={`glass-card overflow-hidden transition-all ${isCurrentWeek ? 'ring-1 ring-cyan-500/30' : ''}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Week {week.week}</span>
              {isCurrentWeek && (
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold">
                  CURRENT
                </span>
              )}
              {week.mockTest && (
                <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-semibold">
                  MOCK TEST
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">{week.phase} · {week.practiceGoal} questions goal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-20 h-1.5 bg-[#151C2C] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progressPct === 100 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 w-8 text-right tabular-nums">{progressPct}%</span>
        </div>
      </button>

      {/* Days */}
      {expanded && (
        <div className="border-t border-white/[0.04] divide-y divide-white/[0.04]">
          {week.topics.map((day) => {
            const dayKey = `week-${week.week}-${day.day}`
            const isCompleted = day.activity === 'rest' || completedDays.includes(dayKey)
            const isRest = day.activity === 'rest'

            return (
              <div
                key={day.day}
                className={`flex items-start gap-3 px-4 py-3 ${isRest ? 'opacity-40' : ''} ${isCompleted && !isRest ? 'opacity-60' : ''}`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => !isRest && onToggleDay(dayKey)}
                  disabled={isRest}
                  className="mt-0.5 flex-shrink-0"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400 transition-colors" />
                  )}
                </button>

                {/* Day label */}
                <span className="text-xs font-medium text-slate-500 w-8 mt-0.5 flex-shrink-0">{day.day}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-sm font-medium ${isCompleted && !isRest ? 'line-through text-slate-500' : 'text-white'}`}>
                      {day.topic || 'Rest Day'}
                    </span>
                    {day.section && (
                      <span className={`text-[10px] font-semibold uppercase ${sectionColor(day.section)}`}>
                        {day.section}
                      </span>
                    )}
                    <ActivityBadge activity={day.activity} />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{day.description}</p>
                </div>

                {/* Duration */}
                {day.durationMinutes > 0 && (
                  <div className="flex items-center gap-1 text-xs text-slate-600 flex-shrink-0 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span className="tabular-nums">{day.durationMinutes}m</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Phase Progress Bar ───────────────────────────────────────

function PhaseProgress({ plan, currentWeek }: { plan: StudyPlan; currentWeek: number }) {
  let cumulative = 0

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-slate-300">Study Phases</span>
      </div>
      <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-[#151C2C]">
        {plan.phases.map((phase, i) => {
          const start = cumulative + 1
          cumulative += phase.weeks
          const end = cumulative
          const isCurrent = currentWeek >= start && currentWeek <= end
          const isCompleted = currentWeek > end

          const colors = [
            'bg-blue-500',
            'bg-cyan-500',
            'bg-emerald-500',
            'bg-purple-500',
          ]

          return (
            <div
              key={phase.name}
              className={`${colors[i]} transition-all ${isCurrent ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-20'}`}
              style={{ width: `${(phase.weeks / plan.totalWeeks) * 100}%` }}
              title={`${phase.name}: Weeks ${start}-${end}`}
            />
          )
        })}
      </div>
      <div className="flex justify-between mt-3">
        {plan.phases.map((phase, i) => {
          const start = cumulative - plan.phases.slice(i).reduce((a, p) => a + p.weeks, 0) + 1
          // Recompute cumulative for labels
          let labelCumulative = 0
          for (let j = 0; j <= i; j++) labelCumulative += plan.phases[j].weeks
          const end = labelCumulative
          const labelStart = end - phase.weeks + 1
          const isCurrent = currentWeek >= labelStart && currentWeek <= end

          return (
            <div key={phase.name} className="text-center" style={{ width: `${(phase.weeks / plan.totalWeeks) * 100}%` }}>
              <p className={`text-[10px] font-semibold ${isCurrent ? 'text-white' : 'text-slate-600'}`}>
                {phase.name}
              </p>
              <p className="text-[10px] text-slate-700">
                Wk {labelStart}–{end}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [completedDays, setCompletedDays] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Fetch existing plan
  useEffect(() => {
    fetch('/api/study-plan')
      .then(res => res.ok ? res.json() : { studyPlan: null, completedDays: [] })
      .then(data => {
        setPlan(data.studyPlan)
        setCompletedDays(data.completedDays ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleGenerate = useCallback(async (config: {
    targetScore: number
    testDate: string
    hoursPerWeek: number
    weakSections: string[]
    weakTopics: string[]
  }) => {
    setGenerating(true)
    try {
      const res = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        const data = await res.json()
        setPlan(data.studyPlan)
        setCompletedDays([])
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setGenerating(false)
    }
  }, [])

  const handleToggleDay = useCallback(async (dayKey: string) => {
    // Optimistic update
    setCompletedDays(prev =>
      prev.includes(dayKey) ? prev.filter(d => d !== dayKey) : [...prev, dayKey]
    )

    try {
      const res = await fetch('/api/study-plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayKey }),
      })
      if (res.ok) {
        const data = await res.json()
        setCompletedDays(data.completedDays)
      }
    } catch {
      // Revert on failure
      setCompletedDays(prev =>
        prev.includes(dayKey) ? prev.filter(d => d !== dayKey) : [...prev, dayKey]
      )
    }
  }, [])

  // Current week estimate based on plan creation date
  const currentWeek = useMemo(() => {
    if (!plan) return 1
    const created = new Date(plan.createdAt)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()
    const weeksSince = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1
    return Math.max(1, Math.min(weeksSince, plan.totalWeeks))
  }, [plan])

  // ── Loading State ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
      </div>
    )
  }

  // ── Setup (no plan) ────────────────────────────────────────

  if (!plan) {
    return (
      <div className="p-6 lg:p-8">
        <SetupForm onGenerate={handleGenerate} isLoading={generating} />
      </div>
    )
  }

  // ── Plan View ──────────────────────────────────────────────

  // Stats
  const totalDays = plan.weeklySchedule.reduce((acc, w) => acc + w.topics.filter(d => d.activity !== 'rest').length, 0)
  const completedCount = completedDays.length
  const overallPct = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Your Study Plan</h1>
          <p className="text-sm text-slate-500">
            {plan.totalWeeks} weeks · {plan.hoursPerWeek} hrs/week · +{plan.estimatedScoreGain} pts estimated
          </p>
        </div>
        <button
          onClick={() => setPlan(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            text-slate-500 hover:text-slate-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]
            transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          New Plan
        </button>
      </div>

      {/* Overall progress */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-300">Overall Progress</span>
          <span className="text-sm font-bold text-cyan-400 tabular-nums">{overallPct}%</span>
        </div>
        <div className="w-full h-2 bg-[#151C2C] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${overallPct === 100 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
          <span>{completedCount} of {totalDays} study days completed</span>
          <span>Week {currentWeek} of {plan.totalWeeks}</span>
        </div>
      </div>

      {/* Phase progress */}
      <PhaseProgress plan={plan} currentWeek={currentWeek} />

      {/* Weekly Schedule */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          Weekly Schedule
        </h2>
        {plan.weeklySchedule.map(week => (
          <WeekCard
            key={week.week}
            week={week}
            isCurrentWeek={week.week === currentWeek}
            completedDays={completedDays}
            onToggleDay={handleToggleDay}
          />
        ))}
      </div>
    </div>
  )
}
