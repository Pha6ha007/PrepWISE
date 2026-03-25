'use client'

import { useState } from 'react'
import {
  MOCK_ERROR_ENTRIES,
  getSessionErrorTrends,
  getErrorsBySection,
  type ErrorType,
  type ErrorEntry,
} from '@/lib/gmat/mock-analytics-data'

const ERROR_TYPE_META: Record<ErrorType, { label: string; color: string; bgColor: string; description: string }> = {
  concept:       { label: 'Concept Error',   color: '#ef4444', bgColor: 'bg-red-500/10',    description: "Didn't understand the underlying concept" },
  careless:      { label: 'Careless Mistake', color: '#f59e0b', bgColor: 'bg-amber-500/10',  description: 'Knew the concept but made an arithmetic/reading error' },
  time_pressure: { label: 'Time Pressure',   color: '#6366f1', bgColor: 'bg-indigo-500/10',  description: 'Ran out of time or rushed the answer' },
  misread:       { label: 'Misread Question', color: '#ec4899', bgColor: 'bg-pink-500/10',    description: 'Misunderstood what was being asked' },
}

const SECTION_LABELS: Record<string, string> = {
  quant: 'Quantitative',
  verbal: 'Verbal',
  'data-insights': 'Data Insights',
}

export function ErrorAnalysis({ errors = MOCK_ERROR_ENTRIES }: { errors?: ErrorEntry[] }) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const totals = errors.reduce((acc, e) => {
    acc[e.errorType] = (acc[e.errorType] || 0) + 1
    return acc
  }, {} as Record<ErrorType, number>)

  const totalErrors = errors.length
  const trends = getSessionErrorTrends(errors)
  const bySection = getErrorsBySection(errors)

  // Filter section data
  const filteredTotals = activeSection
    ? errors.filter(e => e.section === activeSection).reduce((acc, e) => {
        acc[e.errorType] = (acc[e.errorType] || 0) + 1
        return acc
      }, {} as Record<ErrorType, number>)
    : totals

  const filteredTotal = Object.values(filteredTotals).reduce((s, v) => s + v, 0)

  return (
    <div className="bg-[#0D1220] rounded-xl p-6 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Error Analysis</h2>
          <p className="text-sm text-slate-400 mt-0.5">Why you get questions wrong</p>
        </div>
        {/* Section filter pills */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveSection(null)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeSection === null
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            All
          </button>
          {Object.entries(SECTION_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeSection === key
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {label.slice(0, 5)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div className="flex flex-col items-center">
          <DonutChart data={filteredTotals} total={filteredTotal} />
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
            {(Object.keys(ERROR_TYPE_META) as ErrorType[]).map(type => {
              const count = filteredTotals[type] || 0
              const pct = filteredTotal > 0 ? Math.round((count / filteredTotal) * 100) : 0
              return (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: ERROR_TYPE_META[type].color }}
                  />
                  <span className="text-xs text-slate-300">{ERROR_TYPE_META[type].label}</span>
                  <span className="text-xs text-slate-500 ml-auto tabular-nums">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Trend bars — stacked per-session */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Error Trend by Session</h3>
          <div className="space-y-2">
            {trends.map(session => {
              const date = new Date(session.sessionDate)
              const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`
              return (
                <div key={session.sessionDate} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-10 shrink-0 tabular-nums">{dateLabel}</span>
                  <div className="flex-1 flex h-5 rounded overflow-hidden bg-[#1E293B]/50">
                    {(Object.keys(ERROR_TYPE_META) as ErrorType[]).map(type => {
                      const count = session[type]
                      if (count === 0) return null
                      const widthPct = (count / session.total) * 100
                      return (
                        <div
                          key={type}
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${widthPct}%`,
                            backgroundColor: ERROR_TYPE_META[type].color,
                            opacity: 0.8,
                          }}
                          title={`${ERROR_TYPE_META[type].label}: ${count}`}
                        />
                      )
                    })}
                  </div>
                  <span className="text-xs text-slate-500 w-5 text-right tabular-nums">{session.total}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Per-section breakdown */}
      <div className="mt-6 pt-5 border-t border-white/[0.04]">
        <h3 className="text-sm font-medium text-slate-300 mb-3">By Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(bySection).map(([section, counts]) => {
            if (counts.total === 0) return null
            const topError = (Object.keys(ERROR_TYPE_META) as ErrorType[])
              .reduce((max, t) => counts[t] > (counts[max] || 0) ? t : max, 'concept' as ErrorType)
            return (
              <div key={section} className="bg-[#1E293B]/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{SECTION_LABELS[section]}</span>
                  <span className="text-xs text-slate-500">{counts.total} errors</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-[#0A0F1C]">
                  {(Object.keys(ERROR_TYPE_META) as ErrorType[]).map(type => {
                    const pct = (counts[type] / counts.total) * 100
                    if (pct === 0) return null
                    return (
                      <div
                        key={type}
                        className="h-full"
                        style={{ width: `${pct}%`, backgroundColor: ERROR_TYPE_META[type].color }}
                      />
                    )
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Most common: <span style={{ color: ERROR_TYPE_META[topError].color }}>{ERROR_TYPE_META[topError].label}</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** CSS conic-gradient donut chart */
function DonutChart({ data, total }: { data: Record<string, number>; total: number }) {
  if (total === 0) {
    return (
      <div className="relative w-40 h-40">
        <div className="w-full h-full rounded-full bg-[#1E293B]/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-slate-500">No data</span>
        </div>
      </div>
    )
  }

  // Build conic gradient segments
  const types = Object.keys(ERROR_TYPE_META) as ErrorType[]
  let cumulative = 0
  const segments: string[] = []

  for (const type of types) {
    const count = data[type] || 0
    const pct = (count / total) * 100
    const color = ERROR_TYPE_META[type].color
    segments.push(`${color} ${cumulative}% ${cumulative + pct}%`)
    cumulative += pct
  }

  const gradient = `conic-gradient(${segments.join(', ')})`

  return (
    <div className="relative w-40 h-40">
      <div
        className="w-full h-full rounded-full"
        style={{ background: gradient }}
      />
      {/* Inner cutout for donut effect */}
      <div className="absolute inset-[20%] rounded-full bg-[#0D1220] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white tabular-nums">{total}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">errors</div>
        </div>
      </div>
    </div>
  )
}
