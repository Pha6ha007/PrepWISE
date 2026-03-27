'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Mic } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { GmatQuestion } from '@/lib/gmat/question-types'
import { recordSelfReportedError } from '@/lib/gmat/micro-coaching'

// ── Error type definitions ─────────────────────────────────

type ErrorType =
  | 'misidentified'
  | 'missed_detail'
  | 'time_pressure'
  | 'careless'
  | 'concept_gap'

interface ErrorOption {
  type: ErrorType
  label: string
  icon: string
}

const ERROR_OPTIONS: ErrorOption[] = [
  { type: 'misidentified', label: "I misidentified the argument/setup", icon: '🔍' },
  { type: 'missed_detail', label: "I didn't notice a key detail", icon: '👁️' },
  { type: 'time_pressure', label: 'I ran out of time and guessed', icon: '⏱️' },
  { type: 'careless', label: 'I knew the concept but miscalculated', icon: '✏️' },
  { type: 'concept_gap', label: "I don't understand this concept", icon: '📚' },
]

// ── Targeted micro-lessons ─────────────────────────────────

function getMicroLesson(
  errorType: ErrorType,
  question: GmatQuestion,
  userAnswer: string,
): { title: string; body: string } {
  const explanation = question.type === 'RC'
    ? question.questions?.[0]?.explanation || ''
    : (question as any).explanation || ''

  switch (errorType) {
    case 'misidentified':
      return {
        title: 'Identifying the Core Argument',
        body: question.type === 'CR'
          ? `The key is to isolate the conclusion before evaluating answer choices. Look for signal words: "therefore", "thus", "suggests that", "concludes that". The argument here was about "${question.topic}". ${explanation ? `Here's what happened:\n\n${explanation}` : ''}`
          : question.type === 'DS'
          ? `In Data Sufficiency, the "argument" is the question stem. Focus: what exactly are you trying to determine? Don't let the statements distract from the core question.\n\n${explanation}`
          : `Re-read the question stem carefully. The setup often contains the key constraint you need. ${explanation}`,
      }

    case 'missed_detail':
      return {
        title: 'Catching Key Details',
        body: question.type === 'RC'
          ? `For detail questions, always go back to the passage. Don't rely on memory — locate the specific sentence that supports (or contradicts) each answer choice.\n\n${explanation}`
          : question.type === 'CR'
          ? `The missed detail is often a qualifier ("some", "most", "all") or a scope limitation. Re-read the passage paying attention to every qualifier.\n\n${explanation}`
          : `The key detail was in the question setup. For quant questions, annotate every given piece of information before solving.\n\n${explanation}`,
      }

    case 'time_pressure':
      return {
        title: 'Managing Time Pressure',
        body: question.difficulty === 'hard' || question.difficulty === '700+'
          ? `This was a ${question.difficulty} question. On the actual GMAT, consider flagging questions like this and returning to them. Spending 3+ minutes on one question steals time from easier ones.\n\nTip: Set a 2-minute mental timer. If you're not making progress, eliminate 1-2 obviously wrong answers and make your best guess.`
          : `Even for medium-difficulty questions, having a time strategy matters. Aim for ~2 minutes per question. If you're at 1:30 without a clear path, narrow to 2-3 choices and pick.\n\n${explanation}`,
      }

    case 'careless':
      return {
        title: 'Preventing Careless Errors',
        body: question.section === 'quant'
          ? `Your approach was right! To prevent this in the future:\n\n• Double-check signs when multiplying/dividing negatives\n• Re-read what the question ASKS before submitting\n• Plug your answer back into the original equation\n• Write down intermediate steps — don't do too much in your head\n\n${explanation}`
          : `Your reasoning was sound, but the execution slipped. Common careless errors in ${question.type}:\n\n• Misreading "EXCEPT" or "NOT" in the question stem\n• Confusing "must be true" with "could be true"\n• Picking an answer that's true but doesn't answer the question\n\n${explanation}`,
      }

    case 'concept_gap':
      return {
        title: "Let's Break This Down",
        body: explanation || 'Review this topic in your study materials for a deeper understanding.',
      }
  }
}

// ── Component ──────────────────────────────────────────────

interface Props {
  question: GmatQuestion
  userAnswer: string
  correctAnswer: string
  onComplete: () => void  // called when debrief interaction is done
}

export function SocraticDebrief({ question, userAnswer, correctAnswer, onComplete }: Props) {
  const router = useRouter()
  const [selectedError, setSelectedError] = useState<ErrorType | null>(null)
  const [lessonExpanded, setLessonExpanded] = useState(true)

  const handleSelectError = (type: ErrorType) => {
    setSelectedError(type)
    setLessonExpanded(true)
    // Track self-reported error
    recordSelfReportedError(question.type, question.topic, type)
  }

  const microLesson = selectedError
    ? getMicroLesson(selectedError, question, userAnswer)
    : null

  return (
    <div className="mt-4 mb-2">
      {/* Sam's question */}
      <div className="flex items-start gap-3 mb-4">
        {/* Sam avatar */}
        <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center text-lg">
          🧠
        </div>

        {/* Speech bubble */}
        <div className="flex-1 bg-[#0F1525]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl rounded-tl-sm px-5 py-4">
          <p className="text-sm text-slate-200 font-medium mb-1">Sam</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            What made you choose <span className="text-red-300 font-medium">{userAnswer}</span> instead of <span className="text-emerald-300 font-medium">{correctAnswer}</span>?
          </p>
        </div>
      </div>

      {/* Error type pills */}
      <div className="flex flex-wrap gap-2 ml-12 mb-4">
        {ERROR_OPTIONS.map(opt => {
          const isSelected = selectedError === opt.type
          return (
            <button
              key={opt.type}
              onClick={() => handleSelectError(opt.type)}
              className={`
                flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium
                transition-all duration-200
                ${isSelected
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/5'
                  : 'bg-[#0D1220] border border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-slate-300'
                }
              `}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Micro-lesson response */}
      <AnimatePresence mode="wait">
        {microLesson && (
          <motion.div
            key={selectedError}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="ml-12"
          >
            <div className="bg-[#0F1525]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setLessonExpanded(!lessonExpanded)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧠</span>
                  <span className="text-sm font-medium text-white">{microLesson.title}</span>
                </div>
                {lessonExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {/* Body */}
              <AnimatePresence>
                {lessonExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 border-t border-white/[0.04]">
                      <p className="text-sm text-slate-300 leading-relaxed mt-3 whitespace-pre-wrap">
                        {microLesson.body}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ask Sam for more */}
              <div className="px-5 pb-4 flex items-center gap-3">
                <button
                  onClick={() => {
                    const context = encodeURIComponent(
                      `I got a ${question.type} question wrong on "${question.topic}". I self-diagnosed: ${selectedError}. Can you help me understand this better?`
                    )
                    router.push(`/dashboard/session?context=${context}`)
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-cyan-400 bg-cyan-500/5 border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Ask Sam for more
                </button>
                <button
                  onClick={onComplete}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Got it, continue ↓
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
