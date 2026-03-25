'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import { getQuestionOfTheDay } from '@/lib/gmat/question-of-the-day'
import {
  SECTION_META,
  DIFFICULTY_META,
  TYPE_META,
  DS_OPTIONS,
  type AnswerOption,
} from '@/lib/gmat/question-types'

// localStorage key: qotd-YYYY-MM-DD → { answered: true, correct: boolean, answerId: string }
function getStorageKey(dateStr: string) {
  return `qotd-${dateStr}`
}

interface StoredResult {
  answered: true
  correct: boolean
  answerId: string
}

function readResult(dateStr: string): StoredResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(getStorageKey(dateStr))
    if (!raw) return null
    return JSON.parse(raw) as StoredResult
  } catch {
    return null
  }
}

function saveResult(dateStr: string, correct: boolean, answerId: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    getStorageKey(dateStr),
    JSON.stringify({ answered: true, correct, answerId })
  )
}

export function QuestionOfTheDay() {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const { question, section, sectionLabel, dateString } = useMemo(
    () => getQuestionOfTheDay(),
    []
  )

  const sectionMeta = SECTION_META[section]
  const diffMeta = DIFFICULTY_META[question.difficulty]

  // Check if already answered today
  useEffect(() => {
    const stored = readResult(dateString)
    if (stored) {
      setSubmitted(true)
      setSelectedAnswer(stored.answerId)
      setIsCorrect(stored.correct)
    }
  }, [dateString])

  // Get the correct answer
  const correctAnswer =
    question.type === 'RC'
      ? question.questions?.[0]?.correctAnswer ?? ''
      : (question as any).correctAnswer ?? ''

  // Get question text for display
  const displayText =
    question.type === 'PS'
      ? question.text
      : question.type === 'DS'
        ? question.text
        : question.type === 'CR'
          ? question.questionStem
          : question.type === 'RC'
            ? question.questions?.[0]?.questionStem ?? ''
            : ''

  // Get options
  const options: AnswerOption[] =
    question.type === 'DS'
      ? DS_OPTIONS
      : question.type === 'RC'
        ? question.questions?.[0]?.options ?? []
        : (question as any).options ?? []

  const handleSubmit = () => {
    if (!selectedAnswer || submitted) return
    const correct = selectedAnswer === correctAnswer
    setIsCorrect(correct)
    setSubmitted(true)
    saveResult(dateString, correct, selectedAnswer)
  }

  // Section accent colors
  const accentMap: Record<string, { border: string; glow: string; ring: string }> = {
    quant: { border: 'border-cyan-500/20', glow: 'shadow-cyan-500/5', ring: 'ring-cyan-500/30' },
    verbal: { border: 'border-emerald-500/20', glow: 'shadow-emerald-500/5', ring: 'ring-emerald-500/30' },
    'data-insights': { border: 'border-violet-500/20', glow: 'shadow-violet-500/5', ring: 'ring-violet-500/30' },
  }
  const accent = accentMap[section] ?? accentMap.quant

  return (
    <div
      className={`
        rounded-2xl border ${accent.border} bg-[#0D1220]/80 backdrop-blur-md
        shadow-lg ${accent.glow} overflow-hidden transition-all duration-300
      `}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Calendar className={`w-4 h-4 ${sectionMeta.color}`} />
          <span className="text-sm font-semibold text-white">
            Question of the Day
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sectionMeta.bg} ${sectionMeta.color}`}>
            {sectionLabel}
          </span>
        </div>
        {submitted && (
          <div className="flex items-center gap-1.5">
            {isCorrect ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Correct</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-medium text-red-400">Wrong</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Question preview */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${diffMeta.bg} ${diffMeta.color}`}>
            {diffMeta.label}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/[0.06] text-slate-400">
            {TYPE_META[question.type]?.label}
          </span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
          {displayText}
        </p>

        {!expanded && !submitted && (
          <button
            onClick={() => setExpanded(true)}
            className={`
              mt-3 flex items-center gap-1.5 text-xs font-medium
              ${sectionMeta.color} hover:opacity-80 transition-opacity
            `}
          >
            Solve Now
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Expanded: show options inline */}
        {expanded && (
          <div className="mt-4 space-y-2">
            {options.map(opt => {
              const isSelected = selectedAnswer === opt.id
              const isCorrectOpt = opt.id === correctAnswer
              const isUserWrong = submitted && isSelected && !isCorrect

              let optBorder = 'border-white/[0.06]'
              let optBg = 'bg-[#0A0F1E]'
              let optText = 'text-slate-300'

              if (submitted && isCorrectOpt) {
                optBorder = 'border-emerald-500/30'
                optBg = 'bg-emerald-500/5'
                optText = 'text-emerald-300'
              } else if (isUserWrong) {
                optBorder = 'border-red-500/30'
                optBg = 'bg-red-500/5'
                optText = 'text-red-300'
              } else if (isSelected && !submitted) {
                optBorder = 'border-cyan-500'
                optBg = 'bg-cyan-500/10'
                optText = 'text-white'
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => !submitted && setSelectedAnswer(opt.id)}
                  disabled={submitted}
                  className={`
                    w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all text-sm
                    ${optBorder} ${optBg} ${submitted ? 'cursor-default' : 'cursor-pointer hover:border-[#283244]'}
                  `}
                >
                  <span
                    className={`
                      shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold
                      ${submitted && isCorrectOpt
                        ? 'bg-emerald-500 text-white'
                        : isUserWrong
                          ? 'bg-red-500 text-white'
                          : isSelected && !submitted
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/[0.06] text-slate-500'
                      }
                    `}
                  >
                    {opt.id}
                  </span>
                  <span className={`${optText} leading-relaxed`}>
                    {opt.text.length > 80 ? opt.text.slice(0, 80) + '…' : opt.text}
                  </span>
                </button>
              )
            })}

            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className={`
                  w-full mt-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all
                  ${selectedAnswer
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-[#1E293B] text-slate-600 cursor-not-allowed'
                  }
                `}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={() => router.push('/dashboard/practice')}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-medium"
              >
                Practice More →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
