'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Volume2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface WeeklyReviewData {
  review: string
  hasData: boolean
  stats?: {
    totalQuestions: number
    overallAccuracy: number
    sessionCount: number
    totalMinutes: number
    streakDays: number
  }
  generatedAt: string
}

const DISMISS_KEY = 'prepwise-weekly-review-dismissed'

function getDismissKey(): string {
  // Key includes the ISO week so it resets each week
  const now = new Date()
  const oneJan = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.ceil(
    ((now.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7
  )
  return `${DISMISS_KEY}-${now.getFullYear()}-W${weekNum}`
}

function isReviewDay(): boolean {
  const day = new Date().getDay()
  return day === 0 || day === 1 // Sunday or Monday
}

/**
 * WeeklyReview — Sam's weekly progress review widget.
 *
 * Shown on the Session page once per week (Sunday/Monday).
 * Fetches a personalized review from /api/weekly-review.
 * Dismissible via localStorage (resets each week).
 */
export function WeeklyReview() {
  const [data, setData] = useState<WeeklyReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [isNew, setIsNew] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Check if already dismissed this week
    const key = getDismissKey()
    if (localStorage.getItem(key) === 'true') {
      setDismissed(true)
      setLoading(false)
      return
    }

    // Only show on review days (or if there's no data — show the nudge any day)
    if (!isReviewDay()) {
      setLoading(false)
      return
    }

    // Fetch review
    fetch('/api/weekly-review')
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result) setData(result)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Fade the glow after 3 seconds
  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => setIsNew(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [data])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(getDismissKey(), 'true')
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const handleListen = async () => {
    if (!data?.review) return

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
        body: JSON.stringify({ text: data.review }),
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

  // Don't render if loading, dismissed, or no data
  if (loading || dismissed || !data) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative mb-4 mx-4 md:mx-6"
      >
        {/* Soft glow on first appearance */}
        {isNew && (
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-cyan-400/10 to-cyan-500/20 blur-lg animate-pulse" />
        )}

        <div className="relative rounded-2xl border border-cyan-500/20 bg-[#0F1A2E] p-4 md:p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {/* Sam avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sam&apos;s Weekly Review</p>
                <p className="text-[11px] text-slate-500">
                  {data.stats
                    ? `${data.stats.sessionCount} sessions · ${data.stats.totalQuestions} questions this week`
                    : 'Your weekly check-in'}
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 -mt-1 -mr-1"
              aria-label="Dismiss weekly review"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Review text */}
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {data.review}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleListen}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                speaking
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${speaking ? 'animate-pulse' : ''}`} />
              {speaking ? 'Playing…' : 'Listen'}
            </button>

            <button
              onClick={handleDismiss}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
