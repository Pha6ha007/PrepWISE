'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Volume2, X } from 'lucide-react'
import type { GmatQuestion } from '@/lib/gmat/question-types'

interface AnswerRecord {
  question: GmatQuestion
  userAnswer: string
  timeTaken: number
  correct: boolean
}

interface Props {
  answers: AnswerRecord[]
  totalTime: number
}

/**
 * SamMotivator — Sam's post-practice motivator message.
 *
 * Shown at the top of PracticeSummary. Calls /api/agents/chat
 * with a structured prompt asking Sam for a brief, specific
 * motivational comment. NOT a dashboard — feels like Sam talking.
 */
export function SamMotivator({ answers, totalTime }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (answers.length === 0) {
      setLoading(false)
      return
    }

    const total = answers.length
    const correct = answers.filter((a) => a.correct).length
    const accuracy = Math.round((correct / total) * 100)
    const avgTime = Math.round(answers.reduce((s, a) => s + a.timeTaken, 0) / total)

    // Identify weakest type by accuracy
    const byType: Record<string, { correct: number; total: number }> = {}
    for (const a of answers) {
      const t = a.question.type
      if (!byType[t]) byType[t] = { correct: 0, total: 0 }
      byType[t].total++
      if (a.correct) byType[t].correct++
    }
    const weakestType = Object.entries(byType)
      .map(([type, s]) => ({ type, acc: s.total > 0 ? s.correct / s.total : 0 }))
      .sort((a, b) => a.acc - b.acc)[0]

    const errorPatterns = [
      ...new Set(
        answers
          .filter((a) => !a.correct)
          .map((a) => a.question.topic)
          .slice(0, 3),
      ),
    ]

    const prompt = `Student just finished a GMAT practice session:
- ${total} questions, ${correct} correct (${accuracy}% accuracy)
- Average time per question: ${avgTime}s
- Weakest question type: ${weakestType?.type || 'none'} (${weakestType ? Math.round(weakestType.acc * 100) : 0}%)
- Topics with errors: ${errorPatterns.join(', ') || 'none'}

Write a 2-3 sentence reaction as Sam, their GMAT tutor. Be specific about what they did well and name ONE thing to work on next. Sound like a real tutor, not a dashboard. Don't say "Great job!" — be direct and warm.`

    fetch('/api/agents/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        agentType: 'strategy',
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.message) setMessage(data.message)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [answers, totalTime])

  const handleListen = async () => {
    if (!message) return
    if (speaking && audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => {
          setSpeaking(false)
          URL.revokeObjectURL(url)
          audioRef.current = null
        }
        audio.onerror = () => {
          setSpeaking(false)
          audioRef.current = null
        }
        await audio.play()
      } else {
        setSpeaking(false)
      }
    } catch {
      setSpeaking(false)
    }
  }

  if (dismissed || (!loading && !message)) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative mb-6 rounded-2xl border border-cyan-500/20 bg-[#0A1628] p-4 md:p-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Sam's Take</p>
              <p className="text-[11px] text-slate-500">on this session</p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-600 hover:text-slate-400 transition-colors p-1 -mt-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center gap-2 py-2">
            <div className="flex gap-1">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">Sam is reviewing your session…</span>
          </div>
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        )}

        {/* Listen button */}
        {!loading && message && (
          <button
            onClick={handleListen}
            className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              speaking
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${speaking ? 'animate-pulse' : ''}`} />
            {speaking ? 'Playing…' : 'Listen'}
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
