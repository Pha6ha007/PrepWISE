'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ChevronRight, Check, X as XIcon } from 'lucide-react'
import { SECTION_META } from '@/lib/gmat/question-types'
import type { DailyChallenge as DailyChallengeType } from '@/lib/gmat/gamification'

interface DailyChallengeProps {
  challenge: DailyChallengeType
  onStart?: () => void
  onComplete?: (correct: boolean) => void
}

export function DailyChallenge({ challenge, onStart, onComplete }: DailyChallengeProps) {
  const [revealed, setRevealed] = useState(challenge.completed)
  const sectionMeta = SECTION_META[challenge.section]

  // Get a preview of the question text
  const questionText = (() => {
    const q = challenge.question
    if ('text' in q) return q.text
    if ('passage' in q) return q.passage
    return ''
  })()
  const preview = questionText.length > 100
    ? questionText.slice(0, 100) + '…'
    : questionText

  const sectionColors: Record<string, string> = {
    quant: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20',
    verbal: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
    'data-insights': 'from-violet-500/20 to-violet-500/5 border-violet-500/20',
  }

  const accentBorder = sectionColors[challenge.section] ?? sectionColors.quant

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        relative overflow-hidden rounded-2xl border
        bg-gradient-to-br ${accentBorder}
        backdrop-blur-xl p-5
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Daily Challenge</span>
        </div>
        <span className="text-xs text-slate-400 tabular-nums">
          {formatDate(challenge.date)}
        </span>
      </div>

      {/* Section badge */}
      <div className="mb-3">
        <span
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
            ${sectionMeta.bg} ${sectionMeta.color}
          `}
        >
          {sectionMeta.label}
          <span className="text-white/40">·</span>
          <span className="text-white/60">{challenge.topic}</span>
        </span>
      </div>

      {/* Question preview */}
      <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-3">
        {preview}
      </p>

      {/* Action area */}
      {!revealed ? (
        <button
          onClick={() => {
            onStart?.()
          }}
          className="
            flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
            bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08]
            text-sm font-medium text-white transition-all duration-200
            hover:border-white/[0.15] active:scale-[0.98]
          "
        >
          Take Challenge
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            flex items-center gap-3 py-2.5 px-4 rounded-xl
            ${challenge.correct
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'bg-red-500/10 border border-red-500/20'
            }
          `}
        >
          {challenge.correct ? (
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <XIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${challenge.correct ? 'text-emerald-300' : 'text-red-300'}`}>
              {challenge.correct ? 'Correct!' : 'Not quite'}
            </p>
            <p className="text-xs text-slate-400">
              {challenge.correct
                ? 'Great job — streak updated!'
                : 'Review the explanation and try again tomorrow.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Decorative corner sparkle */}
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at top right, rgba(251,191,36,0.3), transparent 70%)',
          }}
        />
      </div>
    </motion.div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
