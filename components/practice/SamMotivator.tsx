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
 * SamMotivator — Sam's post-practice progress-anchor reflection.
 *
 * Calls /api/agents/sam-reflect with structured session data.
 * The endpoint loads historical TopicProgress from DB and generates
 * a "then vs now" observation — not generic praise, a specific delta.
 *
 * Examples:
 *   "Three weeks ago DS was at 45% for you. Today: 71%. That's not
 *    noise — that's a real shift. RC timing is still the gap."
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
    const accuracy = correct / total
    const avgTime = Math.round(answers.reduce((s, a) => s + a.timeTaken, 0) / total)

    // Accuracy by question type
    const byType: Record<string, { correct: number; total: number; accuracy: number }> = {}
    for (const a of answers) {
      const t = a.question.type
      if (!byType[t]) byType[t] = { correct: 0, total: 0, accuracy: 0 }
      byType[t].total++
      if (a.correct) byType[t].correct++
    }
    for (const t of Object.keys(byType)) {
      byType[t].accuracy = byType[t].total > 0 ? byType[t].correct / byType[t].total : 0
    }

    // Topics with errors
    const errorTopics = [
      ...new Set(
        answers
          .filter((a) => !a.correct)
          .map((a) => a.question.topic)
          .slice(0, 4),
      ),
    ]

    const sessionResult = { total, correct, accuracy, avgTime, byType, errorTopics }

    fetch('/api/agents/sam-reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionResult }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.message) setMessage(data.message)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [answers])

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
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Sam's take</p>
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
            <span className="text-xs text-slate-500">Sam is reviewing…</span>
          </div>
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        )}

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
