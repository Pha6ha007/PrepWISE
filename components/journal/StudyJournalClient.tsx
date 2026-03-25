'use client'

import { useState, useMemo } from 'react'
import { Calendar, Flame, Clock, Target, BookOpen, Brain, ChevronLeft, ChevronRight, TrendingUp, AlertTriangle, Star, MessageSquare } from 'lucide-react'

interface JournalEntry {
  id: string
  date: string // YYYY-MM-DD
  totalMinutes: number
  sessionsCount: number
  questionsTotal: number
  questionsCorrect: number
  accuracy: number
  topicsCovered: string[]
  sectionsWorked: string[]
  errorsCount: number
  errorTypes: Record<string, number>
  samInsight: string | null
  milestones: string[]
  userNote: string | null
  confidenceLevel: number | null
}

interface Props {
  entries: JournalEntry[]
  streakDays: number
}

const SECTION_COLORS: Record<string, string> = {
  quant: 'bg-cyan-500',
  verbal: 'bg-emerald-500',
  'data-insights': 'bg-violet-500',
}

const SECTION_LABELS: Record<string, string> = {
  quant: 'Quant',
  verbal: 'Verbal',
  'data-insights': 'DI',
}

export function StudyJournalClient({ entries, streakDays }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  // Build a map of date → entry for fast lookup
  const entryMap = useMemo(() => {
    const map: Record<string, JournalEntry> = {}
    for (const e of entries) map[e.date] = e
    return map
  }, [entries])

  const selectedEntry = selectedDate ? entryMap[selectedDate] : null

  // Calendar grid
  const calendarDays = useMemo(() => {
    const { year, month } = viewMonth
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = firstDay.getDay() // 0=Sun
    const days: { date: string; day: number; isCurrentMonth: boolean }[] = []

    // Previous month padding
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), isCurrentMonth: false })
    }
    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      days.push({ date: date.toISOString().split('T')[0], day: d, isCurrentMonth: true })
    }
    // Next month padding to fill row
    const remaining = 7 - (days.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const date = new Date(year, month + 1, d)
        days.push({ date: date.toISOString().split('T')[0], day: d, isCurrentMonth: false })
      }
    }
    return days
  }, [viewMonth])

  const monthLabel = new Date(viewMonth.year, viewMonth.month).toLocaleDateString('en', { month: 'long', year: 'numeric' })

  const prevMonth = () => setViewMonth(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })
  const nextMonth = () => setViewMonth(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })

  // Heatmap intensity (0-4 based on minutes studied)
  function getIntensity(date: string): number {
    const e = entryMap[date]
    if (!e) return 0
    if (e.totalMinutes >= 60) return 4
    if (e.totalMinutes >= 30) return 3
    if (e.totalMinutes >= 15) return 2
    return 1
  }

  const intensityColors = [
    'bg-[#151C2C]',        // 0 — no activity
    'bg-cyan-900/60',      // 1 — <15min
    'bg-cyan-700/70',      // 2 — 15-30min
    'bg-cyan-500/80',      // 3 — 30-60min
    'bg-cyan-400',         // 4 — 60min+
  ]

  // Stats
  const totalStudyDays = entries.length
  const totalMinutesAll = entries.reduce((s, e) => s + e.totalMinutes, 0)
  const totalQuestionsAll = entries.reduce((s, e) => s + e.questionsTotal, 0)
  const avgAccuracy = entries.length > 0
    ? entries.reduce((s, e) => s + e.accuracy, 0) / entries.length
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-400" />
            Study Journal
          </h1>
          <p className="text-slate-400 mt-1">Your daily GMAT study history</p>
        </div>
        {streakDays > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Flame className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-semibold">{streakDays} day streak</span>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Calendar className="w-4 h-4" />} label="Study days" value={`${totalStudyDays}`} color="text-cyan-400" />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Total time" value={`${Math.floor(totalMinutesAll / 60)}h ${totalMinutesAll % 60}m`} color="text-blue-400" />
        <StatCard icon={<Target className="w-4 h-4" />} label="Questions" value={`${totalQuestionsAll}`} color="text-emerald-400" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Avg accuracy" value={`${(avgAccuracy * 100).toFixed(0)}%`} color="text-violet-400" />
      </div>

      <div className="grid md:grid-cols-[1fr,340px] gap-6">
        {/* Calendar */}
        <div className="glass-card p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-semibold">{monthLabel}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs text-slate-500 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, day, isCurrentMonth }) => {
              const intensity = getIntensity(date)
              const isToday = date === new Date().toISOString().split('T')[0]
              const isSelected = date === selectedDate
              const hasEntry = !!entryMap[date]

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date === selectedDate ? null : date)}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-xs relative
                    transition-all duration-150
                    ${!isCurrentMonth ? 'opacity-25' : ''}
                    ${intensityColors[intensity]}
                    ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-[#0A0F1E]' : ''}
                    ${isToday ? 'font-bold' : ''}
                    ${hasEntry ? 'cursor-pointer hover:ring-1 hover:ring-cyan-500/50' : 'cursor-default'}
                    ${intensity > 0 ? 'text-white' : 'text-slate-500'}
                  `}
                >
                  {day}
                  {hasEntry && entryMap[date].milestones.length > 0 && (
                    <Star className="w-2 h-2 text-amber-400 absolute top-0.5 right-0.5" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
            <span>Less</span>
            {intensityColors.map((color, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Day detail panel */}
        <div className="glass-card p-6 min-h-[400px]">
          {selectedEntry ? (
            <DayDetail entry={selectedEntry} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <BookOpen className="w-8 h-8 text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm">Click a day to see details</p>
              <p className="text-slate-600 text-xs mt-1">Brighter = more study time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Day Detail ──────────────────────────────────────────────

function DayDetail({ entry }: { entry: JournalEntry }) {
  const dateLabel = new Date(entry.date + 'T00:00:00').toLocaleDateString('en', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-semibold">{dateLabel}</h3>
        <p className="text-xs text-slate-500">{entry.sessionsCount} session{entry.sessionsCount !== 1 ? 's' : ''}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="Time" value={`${entry.totalMinutes}m`} />
        <MiniStat label="Questions" value={`${entry.questionsCorrect}/${entry.questionsTotal}`} />
        <MiniStat label="Accuracy" value={`${(entry.accuracy * 100).toFixed(0)}%`} />
        <MiniStat label="Errors" value={`${entry.errorsCount}`} />
      </div>

      {/* Sections worked */}
      {entry.sectionsWorked.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Sections</p>
          <div className="flex gap-1.5">
            {entry.sectionsWorked.map(s => (
              <span key={s} className={`text-xs px-2 py-0.5 rounded-full text-white ${SECTION_COLORS[s] || 'bg-slate-600'}`}>
                {SECTION_LABELS[s] || s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      {entry.topicsCovered.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Topics covered</p>
          <div className="flex flex-wrap gap-1.5">
            {entry.topicsCovered.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#1E293B] text-slate-300 border border-[#283244]">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error breakdown */}
      {entry.errorsCount > 0 && Object.keys(entry.errorTypes).length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Error breakdown
          </p>
          <div className="space-y-1">
            {Object.entries(entry.errorTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 capitalize">{type.replace('_', ' ')}</span>
                <span className="text-slate-300">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sam's insight */}
      {entry.samInsight && (
        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3">
          <p className="text-xs text-cyan-400 mb-1 flex items-center gap-1">
            <Brain className="w-3 h-3" /> Sam's insight
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">{entry.samInsight}</p>
        </div>
      )}

      {/* Milestones */}
      {entry.milestones.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" /> Milestones
          </p>
          <div className="space-y-1">
            {entry.milestones.map((m, i) => (
              <div key={i} className="text-xs text-amber-300 flex items-center gap-1.5">
                <Star className="w-2.5 h-2.5" /> {m}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User note */}
      {entry.userNote && (
        <div className="bg-[#1E293B]/50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Your note
          </p>
          <p className="text-sm text-slate-300">{entry.userNote}</p>
        </div>
      )}

      {/* Confidence */}
      {entry.confidenceLevel && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500">Confidence:</p>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className={`w-4 h-1.5 rounded-full ${
                n <= entry.confidenceLevel! ? 'bg-cyan-400' : 'bg-[#1E293B]'
              }`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string
}) {
  return (
    <div className="glass-card p-4">
      <div className={`${color} mb-1.5`}>{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1E293B]/50 rounded-lg p-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  )
}
