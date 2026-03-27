'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Brain } from 'lucide-react'
import {
  getMicroCoachingTip,
  shouldShowTip,
  recordTipShown,
  getErrorHistory,
} from '@/lib/gmat/micro-coaching'

interface Props {
  questionType: string
  topic: string
}

/**
 * MicroCoachTip — Sam's contextual coaching hint shown BEFORE a question.
 * Pure rule-based: reads error history from localStorage, shows a tip
 * if the student has a pattern of errors on this question type/topic.
 * Dismissible. Won't show the same tip more than 3 times.
 */
export function MicroCoachTip({ questionType, topic }: Props) {
  const [tip, setTip] = useState<string | null>(null)
  const [tipId, setTipId] = useState('')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(false)
    const history = getErrorHistory()
    const result = getMicroCoachingTip(questionType, topic, history)

    if (result.tip && result.tipId && shouldShowTip(result.tipId)) {
      setTip(result.tip)
      setTipId(result.tipId)
      recordTipShown(result.tipId)
    } else {
      setTip(null)
      setTipId('')
    }
  }, [questionType, topic])

  if (!tip || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        key={tipId}
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mb-4 rounded-xl border border-cyan-500/15 bg-[#0A1628] px-4 py-3"
      >
        <div className="flex items-start gap-3">
          {/* Sam avatar */}
          <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center mt-0.5">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-cyan-400 mb-0.5 uppercase tracking-wide">
              Sam's Tip
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors mt-0.5"
            aria-label="Dismiss tip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
