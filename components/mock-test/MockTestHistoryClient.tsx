'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Trophy, Clock, Target, BarChart3 } from 'lucide-react'
import type { MockTestRecord } from '@/app/dashboard/mock-test/history/page'
import { getPercentile, getScoreLabel } from '@/lib/gmat/scoring'

interface Props {
  tests: MockTestRecord[]
}

// ── Helpers ────────────────────────────────────────────────

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtShort(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function pct(v: number | null) {
  return v != null ? `${Math.round(v * 100)}%` : '—'
}

function scoreColor(score: number | null): string {
  if (!score) return 'text-slate-400'
  if (score >= 700) return 'text-emerald-400'
  if (score >= 650) return 'text-cyan-400'
  if (score >= 600) return 'text-amber-400'
  return 'text-red-400'
}

function deltaBadge(delta: number | null) {
  if (delta === null) return null
  if (delta > 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400 font-medium">
      <TrendingUp className="w-3 h-3" />+{delta}
    </span>
  )
  if (delta < 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-red-400 font-medium">
      <TrendingDown className="w-3 h-3" />{delta}
    </span>
  )
  return <span className="inline-flex items-center gap-0.5 text-xs text-slate-500"><Minus className="w-3 h-3" />0</span>
}

// ── SVG Score Chart ────────────────────────────────────────
// Pure SVG — no external chart library needed.

function ScoreChart({ tests }: { tests: MockTestRecord[] }) {
  const scored = tests.filter(t => t.totalScore != null)
  if (scored.length < 2) return null

  const W = 600
  const H = 200
  const PAD = { top: 16, right: 24, bottom: 32, left: 48 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const scores = scored.map(t => t.totalScore!)
  const minScore = Math.max(205, Math.min(...scores) - 30)
  const maxScore = Math.min(805, Math.max(...scores) + 30)
  const range = maxScore - minScore || 1

  // Map value → Y coordinate (inverted)
  const y = (v: number) => PAD.top + innerH - ((v - minScore) / range) * innerH
  const x = (i: number) => PAD.left + (i / (scored.length - 1)) * innerW

  // Build path strings
  const pointsTotal = scored.map((t, i) => `${x(i)},${y(t.totalScore!)}`)
  const polylineTotal = pointsTotal.join(' ')

  // Fill area under the line
  const fillPath = `M${x(0)},${y(scored[0].totalScore!)} ` +
    scored.slice(1).map((t, i) => `L${x(i + 1)},${y(t.totalScore!)}`).join(' ') +
    ` L${x(scored.length - 1)},${PAD.top + innerH} L${PAD.left},${PAD.top + innerH} Z`

  // Y-axis grid lines
  const gridValues = [minScore, Math.round((minScore + maxScore) / 2), maxScore]

  // Section score paths
  const quantPoints = scored.map((t, i) =>
    t.quantScore ? `${x(i)},${y(PAD.top + innerH - ((t.quantScore - 60) / 30) * innerH + PAD.top)}` : null
  )

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 320 }}
        aria-label="Score progression chart"
      >
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridValues.map(v => (
          <g key={v}>
            <line
              x1={PAD.left} y1={y(v)}
              x2={PAD.left + innerW} y2={y(v)}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            />
            <text
              x={PAD.left - 6} y={y(v)}
              textAnchor="end" dominantBaseline="middle"
              className="fill-slate-500" fontSize="10" fontFamily="inherit"
            >
              {v}
            </text>
          </g>
        ))}

        {/* Fill */}
        <path d={fillPath} fill="url(#scoreGrad)" />

        {/* Total score line */}
        <polyline
          points={polylineTotal}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points + labels */}
        {scored.map((t, i) => (
          <g key={t.id}>
            <circle cx={x(i)} cy={y(t.totalScore!)} r="5" fill="#0B1120" stroke="#06b6d4" strokeWidth="2.5" />
            {/* Score label above point */}
            <text
              x={x(i)} y={y(t.totalScore!) - 10}
              textAnchor="middle" fontSize="11" fontFamily="inherit"
              className="fill-white" fontWeight="600"
            >
              {t.totalScore}
            </text>
            {/* Date label below axis */}
            <text
              x={x(i)} y={PAD.top + innerH + 14}
              textAnchor="middle" fontSize="10" fontFamily="inherit"
              className="fill-slate-500"
            >
              {fmtShort(t.takenAt)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// ── Comparison Card ────────────────────────────────────────

function CompareCard({
  label,
  first,
  last,
}: {
  label: string
  first: number | null
  last: number | null
}) {
  const delta = first != null && last != null ? last - first : null

  return (
    <div className="bg-[#151C2C]/80 border border-white/[0.06] rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-slate-600 mb-0.5">Test #1</p>
          <p className="text-2xl font-bold text-slate-400 tabular-nums">{first ?? '—'}</p>
        </div>
        <div className="flex-1 flex items-center justify-center pb-1">
          {deltaBadge(delta)}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-600 mb-0.5">Latest</p>
          <p className={`text-2xl font-bold tabular-nums ${scoreColor(last)}`}>{last ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────

export default function MockTestHistoryClient({ tests }: Props) {
  const scored = useMemo(() => tests.filter(t => t.totalScore != null), [tests])
  const first = scored[0] ?? null
  const last = scored[scored.length - 1] ?? null

  const totalDelta = first && last && first.id !== last.id
    ? (last.totalScore ?? 0) - (first.totalScore ?? 0)
    : null

  const bestTest = useMemo(
    () => scored.reduce<MockTestRecord | null>((best, t) =>
      !best || (t.totalScore ?? 0) > (best.totalScore ?? 0) ? t : best
    , null),
    [scored]
  )

  // Empty state
  if (tests.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Header />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-cyan-500/50" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No mock tests yet</h2>
          <p className="text-slate-500 text-sm max-w-xs mb-6">
            Complete your first mock test to start tracking your score progression.
          </p>
          <Link
            href="/dashboard/mock-test"
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Take a Mock Test
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Header />

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill icon={<Target className="w-4 h-4" />} label="Tests Taken" value={tests.length.toString()} color="text-cyan-400" />
        <StatPill
          icon={<Trophy className="w-4 h-4" />}
          label="Best Score"
          value={bestTest?.totalScore?.toString() ?? '—'}
          color="text-amber-400"
        />
        <StatPill
          icon={<TrendingUp className="w-4 h-4" />}
          label="Improvement"
          value={totalDelta != null ? (totalDelta >= 0 ? `+${totalDelta}` : `${totalDelta}`) : '—'}
          color={totalDelta != null && totalDelta > 0 ? 'text-emerald-400' : totalDelta != null && totalDelta < 0 ? 'text-red-400' : 'text-slate-400'}
        />
        <StatPill
          icon={<Clock className="w-4 h-4" />}
          label="Avg Duration"
          value={tests.length > 0
            ? `${Math.round(tests.reduce((s, t) => s + t.durationMins, 0) / tests.length)}m`
            : '—'}
          color="text-violet-400"
        />
      </div>

      {/* Score progression chart */}
      {scored.length >= 2 && (
        <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Score Progression
          </h2>
          <ScoreChart tests={tests} />
        </div>
      )}

      {/* First vs Latest comparison */}
      {first && last && first.id !== last.id && (
        <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">
            First → Latest Comparison
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CompareCard label="Total Score" first={first.totalScore} last={last.totalScore} />
            <CompareCard label="Quantitative" first={first.quantScore} last={last.quantScore} />
            <CompareCard label="Verbal" first={first.verbalScore} last={last.verbalScore} />
            <CompareCard label="Data Insights" first={first.dataInsightsScore} last={last.dataInsightsScore} />
          </div>
        </div>
      )}

      {/* Test list */}
      <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-semibold text-white">All Tests</h2>
        </div>

        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 px-6 py-2.5 border-b border-white/[0.04] text-xs font-medium text-slate-500 uppercase tracking-wider">
          <span>Date</span>
          <span className="text-right">Total</span>
          <span className="text-right">Quant</span>
          <span className="text-right">Verbal</span>
          <span className="text-right">DI</span>
          <span className="text-right">Duration</span>
          <span className="text-right">Percentile</span>
        </div>

        {/* Rows — newest first for the list */}
        {[...tests].reverse().map((t, idx) => {
          const num = tests.length - idx
          const percentile = t.totalScore ? getPercentile(t.totalScore) : null
          const prevTest = idx < tests.length - 1 ? [...tests].reverse()[idx + 1] : null
          const delta = t.totalScore && prevTest?.totalScore
            ? t.totalScore - prevTest.totalScore
            : null

          return (
            <div
              key={t.id}
              className="grid grid-cols-[auto_1fr] sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 px-6 py-4 border-b border-white/[0.04] last:border-0 items-center hover:bg-white/[0.02] transition-colors"
            >
              {/* Mobile: stacked layout */}
              <div className="sm:hidden col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    Test #{num} · {fmt(t.takenAt)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Q: {t.quantScore ?? '—'} · V: {t.verbalScore ?? '—'} · DI: {t.dataInsightsScore ?? '—'} · {t.durationMins}m
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold tabular-nums ${scoreColor(t.totalScore)}`}>
                    {t.totalScore ?? '—'}
                  </p>
                  {percentile && <p className="text-xs text-slate-500">{percentile}th %ile</p>}
                  <div className="mt-0.5">{deltaBadge(delta)}</div>
                </div>
              </div>

              {/* Desktop: row cells */}
              <div className="hidden sm:block">
                <span className="text-sm text-white">Test #{num}</span>
                <span className="text-xs text-slate-500 ml-2">{fmt(t.takenAt)}</span>
                {delta !== null && <span className="ml-2">{deltaBadge(delta)}</span>}
              </div>
              <div className="hidden sm:block text-right">
                <span className={`text-sm font-bold tabular-nums ${scoreColor(t.totalScore)}`}>
                  {t.totalScore ?? '—'}
                </span>
              </div>
              <div className="hidden sm:block text-right text-sm text-slate-300 tabular-nums">
                {t.quantScore ?? '—'}
              </div>
              <div className="hidden sm:block text-right text-sm text-slate-300 tabular-nums">
                {t.verbalScore ?? '—'}
              </div>
              <div className="hidden sm:block text-right text-sm text-slate-300 tabular-nums">
                {t.dataInsightsScore ?? '—'}
              </div>
              <div className="hidden sm:block text-right text-xs text-slate-500">
                {t.durationMins}m
              </div>
              <div className="hidden sm:block text-right text-xs text-slate-500">
                {percentile ? `${percentile}th` : '—'}
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <Link
          href="/dashboard/mock-test"
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Take Another Mock Test
        </Link>
      </div>
    </div>
  )
}

// ── Small sub-components ───────────────────────────────────

function Header() {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/dashboard/mock-test"
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        aria-label="Back to mock test"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-white">Mock Test History</h1>
        <p className="text-slate-400 text-sm mt-0.5">Track your score progression over time</p>
      </div>
    </div>
  )
}

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-4">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}
