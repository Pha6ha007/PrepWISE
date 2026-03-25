'use client'

import { useMemo } from 'react'
import { Brain, Clock, Flame, ChevronRight, Zap, AlertTriangle } from 'lucide-react'
import { Rating } from 'ts-fsrs'
import {
  type ReviewCard,
  type ReviewSchedule,
  getRetrievability,
  getRatingColor,
  generateStudyRecommendation,
} from '@/lib/gmat/spaced-repetition'

interface Props {
  schedule: ReviewSchedule
  onStartReview: (card: ReviewCard) => void
}

const SECTION_LABELS: Record<string, string> = {
  quant: 'Quant',
  verbal: 'Verbal',
  'data-insights': 'DI',
}

const SECTION_COLORS: Record<string, string> = {
  quant: 'bg-cyan-500/20 text-cyan-400',
  verbal: 'bg-emerald-500/20 text-emerald-400',
  'data-insights': 'bg-violet-500/20 text-violet-400',
}

export function SmartReviewPanel({ schedule, onStartReview }: Props) {
  const recommendation = useMemo(
    () => generateStudyRecommendation(schedule),
    [schedule]
  )

  const totalDue = schedule.dueNow.length + schedule.dueToday.length

  return (
    <div className="glass-card p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Smart Review</h2>
          <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full font-medium">
            FSRS
          </span>
        </div>
        {totalDue > 0 && (
          <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full">
            {totalDue} due
          </span>
        )}
      </div>

      {/* Sam's recommendation */}
      <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3 mb-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          <span className="text-cyan-400 font-medium">Sam: </span>
          {recommendation}
        </p>
      </div>

      {/* Due now cards */}
      {schedule.dueNow.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-medium text-red-400">Due now — memory fading</span>
          </div>
          <div className="space-y-1.5">
            {schedule.dueNow.slice(0, 5).map(card => (
              <ReviewCardRow
                key={`${card.topicId}-${card.subtopic}`}
                card={card}
                urgent
                onClick={() => onStartReview(card)}
              />
            ))}
            {schedule.dueNow.length > 5 && (
              <p className="text-xs text-slate-500 pl-2">
                +{schedule.dueNow.length - 5} more due now
              </p>
            )}
          </div>
        </div>
      )}

      {/* Due today */}
      {schedule.dueToday.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Later today</span>
          </div>
          <div className="space-y-1.5">
            {schedule.dueToday.slice(0, 3).map(card => (
              <ReviewCardRow
                key={`${card.topicId}-${card.subtopic}`}
                card={card}
                onClick={() => onStartReview(card)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {schedule.upcoming.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-medium text-slate-500">This week</span>
          </div>
          <div className="space-y-1.5">
            {schedule.upcoming.slice(0, 3).map(card => (
              <ReviewCardRow
                key={`${card.topicId}-${card.subtopic}`}
                card={card}
                onClick={() => onStartReview(card)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
        <span className="text-xs text-slate-600">
          {schedule.mastered.length} mastered · {schedule.upcoming.length} upcoming
        </span>
        <span className="text-xs text-slate-600">
          Powered by FSRS algorithm
        </span>
      </div>
    </div>
  )
}

// ── Individual card row ────────────────────────────────────

function ReviewCardRow({
  card,
  urgent,
  onClick,
}: {
  card: ReviewCard
  urgent?: boolean
  onClick: () => void
}) {
  const retrievability = getRetrievability(card.card)
  const pct = Math.round(retrievability * 100)

  // Retrievability bar color
  const barColor = pct >= 80 ? 'bg-emerald-400'
    : pct >= 60 ? 'bg-cyan-400'
    : pct >= 40 ? 'bg-amber-400'
    : 'bg-red-400'

  const topicLabel = card.topicId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left
        ${urgent
          ? 'bg-red-500/5 border border-red-500/10 hover:bg-red-500/10'
          : 'bg-[#1E293B]/40 hover:bg-[#1E293B]/70'
        }
      `}
    >
      {/* Section badge */}
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SECTION_COLORS[card.section] || 'bg-slate-600/20 text-slate-400'}`}>
        {SECTION_LABELS[card.section] || card.section}
      </span>

      {/* Topic name */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-white truncate block">{topicLabel}</span>
        {card.subtopic && (
          <span className="text-xs text-slate-500 truncate block">{card.subtopic}</span>
        )}
      </div>

      {/* Retrievability meter */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-12 h-1.5 bg-[#151C2C] rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-xs tabular-nums w-8 text-right ${pct < 50 ? 'text-red-400' : 'text-slate-500'}`}>
          {pct}%
        </span>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
    </button>
  )
}
