'use client'

import {
  MOCK_SCORE_HISTORY,
  MOCK_SECTION_ACCURACY,
  MOCK_TARGET_SCORE,
  type ScoreSnapshot,
} from '@/lib/gmat/mock-analytics-data'
import {
  estimateSectionScore,
  estimateTotalScore,
  getPercentile,
  getScoreLabel,
} from '@/lib/gmat/scoring'

const SECTION_META: Record<string, { label: string; color: string; bgColor: string }> = {
  quant:           { label: 'Quantitative',  color: 'text-blue-400',   bgColor: 'bg-blue-400' },
  verbal:          { label: 'Verbal',        color: 'text-emerald-400', bgColor: 'bg-emerald-400' },
  'data-insights': { label: 'Data Insights', color: 'text-violet-400', bgColor: 'bg-violet-400' },
}

interface ScorePredictorProps {
  sectionAccuracy?: Record<string, number>
  scoreHistory?: ScoreSnapshot[]
  targetScore?: number
}

export function ScorePredictor({
  sectionAccuracy = MOCK_SECTION_ACCURACY,
  scoreHistory = MOCK_SCORE_HISTORY,
  targetScore = MOCK_TARGET_SCORE,
}: ScorePredictorProps) {
  // Compute current estimated scores
  const quantScore = estimateSectionScore(sectionAccuracy.quant || 0)
  const verbalScore = estimateSectionScore(sectionAccuracy.verbal || 0)
  const diScore = estimateSectionScore(sectionAccuracy['data-insights'] || 0)
  const totalScore = estimateTotalScore(quantScore, verbalScore, diScore)
  const percentile = getPercentile(totalScore)
  const label = getScoreLabel(totalScore)

  const gap = targetScore - totalScore
  const latestHistory = scoreHistory.slice(-7)

  // Score range for the trend sparkline
  const scores = latestHistory.map(s => s.totalScore)
  const minScore = Math.min(...scores) - 20
  const maxScore = Math.max(...scores, targetScore) + 20
  const range = maxScore - minScore

  return (
    <div className="bg-[#0D1220] rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="p-6">
        {/* Main score display */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="text-center md:text-left">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estimated GMAT Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-white tabular-nums tracking-tight">{totalScore}</span>
              <span className="text-lg text-slate-500">/805</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-300">{label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-400 tabular-nums">
                {percentile}th percentile
              </span>
            </div>
          </div>

          {/* Section scores */}
          <div className="flex-1 grid grid-cols-3 gap-3">
            {[
              { key: 'quant', score: quantScore, acc: sectionAccuracy.quant || 0 },
              { key: 'verbal', score: verbalScore, acc: sectionAccuracy.verbal || 0 },
              { key: 'data-insights', score: diScore, acc: sectionAccuracy['data-insights'] || 0 },
            ].map(({ key, score, acc }) => {
              const meta = SECTION_META[key]
              const fillPct = ((score - 60) / 30) * 100 // 60-90 scale
              return (
                <div key={key} className="bg-[#1E293B]/40 rounded-lg p-3">
                  <div className={`text-xs font-medium ${meta.color} mb-1`}>{meta.label}</div>
                  <div className="text-xl font-bold text-white tabular-nums">{score}</div>
                  <div className="text-[10px] text-slate-500 tabular-nums">{Math.round(acc * 100)}% accuracy</div>
                  <div className="h-1.5 bg-[#0A0F1C] rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.bgColor} transition-all duration-500`}
                      style={{ width: `${fillPct}%`, opacity: 0.7 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Target comparison */}
        <div className="mt-5 flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/30">
          <div className="flex items-center gap-2 flex-1">
            <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
            <span className="text-sm text-slate-300">
              Target: <span className="text-white font-semibold tabular-nums">{targetScore}</span>
            </span>
          </div>
          {gap > 0 ? (
            <span className="text-sm text-amber-400 font-medium tabular-nums">
              {gap} points away
            </span>
          ) : (
            <span className="text-sm text-emerald-400 font-medium">
              🎯 Target reached!
            </span>
          )}
        </div>

        {/* Score trend sparkline */}
        {latestHistory.length > 1 && (
          <div className="mt-5">
            <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Score Trend</h3>
            <div className="relative h-20">
              {/* Target line */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-cyan-500/30"
                style={{ top: `${100 - ((targetScore - minScore) / range) * 100}%` }}
              >
                <span className="absolute right-0 -top-4 text-[10px] text-cyan-500/60 tabular-nums">{targetScore}</span>
              </div>

              {/* Score line — SVG polyline */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${latestHistory.length - 1} 100`}>
                <polyline
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  points={latestHistory.map((s, i) => {
                    const x = i
                    const y = 100 - ((s.totalScore - minScore) / range) * 100
                    return `${x},${y}`
                  }).join(' ')}
                />
                {/* Dots */}
                {latestHistory.map((s, i) => {
                  const x = (i / (latestHistory.length - 1)) * 100
                  const y = 100 - ((s.totalScore - minScore) / range) * 100
                  return (
                    <circle
                      key={i}
                      cx={i}
                      cy={y}
                      r="3"
                      fill="#0D1220"
                      stroke="#22d3ee"
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                    />
                  )
                })}
              </svg>

              {/* Date labels */}
              <div className="flex justify-between mt-1">
                {latestHistory.map((s, i) => {
                  const d = new Date(s.date)
                  return (
                    <span key={i} className="text-[10px] text-slate-600 tabular-nums">
                      {d.getMonth() + 1}/{d.getDate()}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
