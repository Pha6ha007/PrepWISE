'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  Flame,
  BookOpen,
  BrainCircuit,
  Bed,
  Volume2,
} from 'lucide-react'
import {
  generatePreExamPlan,
  getTodaysPlan,
  getTodaysMindsetTip,
  type PreExamPlan,
  type PreExamDay,
} from '@/lib/gmat/pre-exam'

// ── Props ────────────────────────────────────────────────────

interface PreExamBannerProps {
  testDate: string
  weakTopics?: string[]
  currentAccuracy?: Record<string, number>
  mockTestsTaken?: number
}

// ── Day icon helper ──────────────────────────────────────────

function dayIcon(day: PreExamDay) {
  if (day.isRestDay) return <Bed className="w-4 h-4" />
  if (day.isMockTestDay) return <BrainCircuit className="w-4 h-4" />
  return <BookOpen className="w-4 h-4" />
}

// ── Progress dots ────────────────────────────────────────────

function ProgressDots({ plan }: { plan: PreExamPlan }) {
  const passedDays = 7 - plan.daysUntilExam

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 7 }, (_, i) => {
        const dayNumber = 7 - i
        const isPast = i < passedDays
        const isToday = dayNumber === plan.daysUntilExam

        return (
          <div key={dayNumber} className="flex flex-col items-center gap-1">
            {isPast ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            ) : isToday ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              </motion.div>
            ) : (
              <Circle className="w-3.5 h-3.5 text-amber-400/30" />
            )}
            <span className={`text-[10px] ${isToday ? 'text-amber-300 font-bold' : 'text-amber-400/40'}`}>
              {dayNumber}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────

export function PreExamBanner({
  testDate,
  weakTopics = [],
  currentAccuracy = {},
  mockTestsTaken = 0,
}: PreExamBannerProps) {
  const plan = useMemo(
    () => generatePreExamPlan(testDate, weakTopics, currentAccuracy, mockTestsTaken),
    [testDate, weakTopics, currentAccuracy, mockTestsTaken],
  )

  const todaysPlan = useMemo(() => getTodaysPlan(plan), [plan])
  const mindsetTip = useMemo(() => getTodaysMindsetTip(plan), [plan])

  // AI-generated Sam coaching message for today
  const [aiMessage, setAiMessage] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!plan.isActive) return
    setAiLoading(true)
    fetch('/api/pre-exam-coaching')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.message) setAiMessage(data.message)
      })
      .catch(() => {})
      .finally(() => setAiLoading(false))
  }, [plan.isActive])

  const handleListen = async (text: string) => {
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
        body: JSON.stringify({ text }),
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

  if (!plan.isActive || !todaysPlan) return null

  const recommendedHref = todaysPlan.isMockTestDay
    ? '/dashboard/mock-test'
    : todaysPlan.isRestDay
      ? '/dashboard/formulas'
      : '/dashboard/practice'

  const recommendedLabel = todaysPlan.isMockTestDay
    ? 'Start Mock Test'
    : todaysPlan.isRestDay
      ? 'Browse Formulas'
      : 'Start Practice'

  // AI message takes priority; fall back to static mindset tip
  const samMessage = aiMessage || mindsetTip

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-4 md:mx-6 mt-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.05] to-amber-600/[0.08] backdrop-blur-sm overflow-hidden"
    >
      {/* Top bar — countdown + progress */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-amber-500/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/15">
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-200 tracking-tight">
              🎯 {plan.daysUntilExam} {plan.daysUntilExam === 1 ? 'Day' : 'Days'} to GMAT
            </h3>
            <p className="text-[11px] text-amber-400/60">Pre-Exam Mode Active</p>
          </div>
        </div>
        <ProgressDots plan={plan} />
      </div>

      {/* Body — today's plan + Sam coaching message */}
      <div className="px-5 py-4 space-y-3">
        {/* Today's focus */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            {dayIcon(todaysPlan)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Today&apos;s Focus
              </span>
              {todaysPlan.durationMinutes > 0 && (
                <span className="text-[10px] text-amber-400/50 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {todaysPlan.durationMinutes} min
                </span>
              )}
            </div>
            <p className="text-sm text-slate-200 font-medium mt-0.5">{todaysPlan.focus}</p>
            <ul className="mt-1.5 space-y-0.5">
              {todaysPlan.activities.slice(0, 3).map((activity, i) => (
                <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                  <span className="text-amber-500/50 mt-0.5">•</span>
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sam's coaching message — AI-generated with TTS, falls back to static */}
        {(samMessage || aiLoading) && (
          <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/10 px-4 py-3">
            {aiLoading && !samMessage ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 100, 200].map((d) => (
                    <div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-amber-500/40 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-amber-400/50">Sam is thinking…</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-amber-200/80 italic leading-relaxed">
                  💬 Sam says: &ldquo;{samMessage}&rdquo;
                </p>
                <button
                  onClick={() => samMessage && handleListen(samMessage)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    speaking
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-amber-500/[0.08] text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/15 border border-amber-500/[0.15]'
                  }`}
                >
                  <Volume2 className={`w-3 h-3 ${speaking ? 'animate-pulse' : ''}`} />
                  {speaking ? 'Playing…' : 'Listen to Sam'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <Link
          href={recommendedHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition-colors"
        >
          {recommendedLabel}
          <span className="text-amber-500">→</span>
        </Link>
      </div>
    </motion.div>
  )
}
