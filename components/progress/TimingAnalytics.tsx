'use client'

import {
  MOCK_TIMING_DATA,
  computeTimingStats,
  TARGET_PACE,
  SECTION_LABELS,
  type TimingEntry,
} from '@/lib/gmat/mock-analytics-data'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function TimingAnalytics({ data = MOCK_TIMING_DATA }: { data?: TimingEntry[] }) {
  const stats = computeTimingStats(data)

  // Find the max time for scaling bars (use the larger of actual or target, plus padding)
  const maxTime = Math.max(...stats.flatMap(s => [s.avgTimeSec, s.targetTimeSec])) * 1.2

  return (
    <div className="bg-[#0D1220] rounded-xl p-6 border border-white/[0.06]">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Timing Analytics</h2>
        <p className="text-sm text-slate-400 mt-0.5">Time management across sections</p>
      </div>

      {/* Horizontal bar comparison: actual vs target */}
      <div className="space-y-5">
        {stats.map(s => {
          const actualPct = (s.avgTimeSec / maxTime) * 100
          const targetPct = (s.targetTimeSec / maxTime) * 100
          const diff = s.avgTimeSec - s.targetTimeSec
          const isOverPace = diff > 0
          const diffLabel = isOverPace ? `+${formatTime(diff)} slow` : `${formatTime(Math.abs(diff))} fast`
          const barColor = isOverPace ? 'bg-red-500' : 'bg-emerald-500'
          const diffColor = isOverPace ? 'text-red-400' : 'text-emerald-400'

          return (
            <div key={s.section}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-white">{s.sectionLabel}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    Avg: <span className="text-white font-medium tabular-nums">{formatTime(s.avgTimeSec)}</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Target: <span className="tabular-nums">{formatTime(s.targetTimeSec)}</span>
                  </span>
                  <span className={`text-xs font-medium tabular-nums ${diffColor}`}>{diffLabel}</span>
                </div>
              </div>

              <div className="relative h-6 bg-[#1E293B]/50 rounded">
                {/* Actual pace bar */}
                <div
                  className={`absolute top-0 left-0 h-full rounded transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(actualPct, 100)}%`, opacity: 0.7 }}
                />
                {/* Target marker line */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-white/40"
                  style={{ left: `${targetPct}%` }}
                />
                <div
                  className="absolute -top-5 text-[10px] text-slate-500 -translate-x-1/2"
                  style={{ left: `${targetPct}%` }}
                >
                  target
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Speed distribution stats */}
      <div className="mt-6 pt-5 border-t border-white/[0.04]">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Pace Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats.map(s => {
            const tooFastPct = s.totalQuestions > 0 ? Math.round((s.tooFast / s.totalQuestions) * 100) : 0
            const tooSlowPct = s.totalQuestions > 0 ? Math.round((s.tooSlow / s.totalQuestions) * 100) : 0
            const onPacePct = 100 - tooFastPct - tooSlowPct

            return (
              <div key={s.section} className="bg-[#1E293B]/40 rounded-lg p-3">
                <div className="text-sm font-medium text-white mb-2">{s.sectionLabel}</div>
                <div className="space-y-1.5">
                  <PaceStat label="Too fast (<30s)" value={s.tooFast} pct={tooFastPct} color="text-amber-400" barColor="bg-amber-400" />
                  <PaceStat label="On pace" value={s.onPace} pct={onPacePct} color="text-emerald-400" barColor="bg-emerald-400" />
                  <PaceStat label="Too slow (>3min)" value={s.tooSlow} pct={tooSlowPct} color="text-red-400" barColor="bg-red-400" />
                </div>
                <div className="flex h-1.5 rounded-full overflow-hidden bg-[#0A0F1C] mt-2">
                  {tooFastPct > 0 && <div className="bg-amber-400 h-full" style={{ width: `${tooFastPct}%` }} />}
                  {onPacePct > 0 && <div className="bg-emerald-400 h-full" style={{ width: `${onPacePct}%` }} />}
                  {tooSlowPct > 0 && <div className="bg-red-400 h-full" style={{ width: `${tooSlowPct}%` }} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PaceStat({
  label, value, pct, color,
}: {
  label: string; value: number; pct: number; color: string; barColor: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs font-medium tabular-nums ${color}`}>{value}</span>
        <span className="text-[10px] text-slate-500 tabular-nums">({pct}%)</span>
      </div>
    </div>
  )
}
