'use client'

import { useState, useEffect, useRef } from 'react'
import { Clock, ChevronRight, ChevronLeft, X } from 'lucide-react'
import {
  type GmatQuestion,
  type AnswerOption,
  DS_OPTIONS,
  SECTION_META,
  TYPE_META,
  DIFFICULTY_META,
} from '@/lib/gmat/question-types'
import {
  getMicroCoachingTip,
  getErrorHistory,
  shouldShowTip,
  recordTipShown,
} from '@/lib/gmat/micro-coaching'

interface Props {
  question: GmatQuestion
  questionNumber: number
  totalQuestions: number
  onSubmit: (answerId: string, timeTaken: number) => void
  timedMode?: boolean    // 2-min countdown when true
  disabled?: boolean     // After submission
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  timedMode = false,
  disabled = false,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const startTime = useRef(Date.now())

  // Reset when question changes
  useEffect(() => {
    setSelected(null)
    setElapsed(0)
    startTime.current = Date.now()
  }, [question.id])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [question.id])

  const handleSubmit = () => {
    if (!selected || disabled) return
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000)
    onSubmit(selected, timeTaken)
  }

  const section = SECTION_META[question.section]
  const qtype = TYPE_META[question.type]
  const diff = DIFFICULTY_META[question.difficulty]

  // Timer display
  const timerMins = Math.floor(elapsed / 60)
  const timerSecs = elapsed % 60
  const timerStr = `${timerMins}:${timerSecs.toString().padStart(2, '0')}`
  const timerWarning = timedMode && elapsed >= 90  // Amber at 1:30
  const timerDanger = timedMode && elapsed >= 110   // Red at 1:50

  // ── Micro-coaching tip ────────────────────────────
  const [tipDismissed, setTipDismissed] = useState(false)

  // Reset tip dismissed state when question changes
  useEffect(() => {
    setTipDismissed(false)
  }, [question.id])

  const coaching = (() => {
    if (disabled || tipDismissed) return null
    const errorHistory = getErrorHistory()
    const result = getMicroCoachingTip(question.type, question.topic, errorHistory)
    if (!result.tip || !shouldShowTip(result.tipId)) return null
    return result
  })()

  // Record tip shown on mount (once per tip)
  useEffect(() => {
    if (coaching?.tipId) {
      recordTipShown(coaching.tipId)
    }
  // Only run when tipId changes — coaching object ref changes every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coaching?.tipId])

  return (
    <div className="w-full">
      {/* ── Micro-coaching tip ────────────────────── */}
      {coaching?.tip && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04]">
          <span className="shrink-0 text-base mt-0.5">💡</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-300/80 mb-0.5">Sam&apos;s tip</p>
            <p className="text-sm text-slate-300 leading-relaxed">{coaching.tip}</p>
          </div>
          <button
            onClick={() => setTipDismissed(true)}
            className="shrink-0 p-1 rounded-md text-slate-600 hover:text-slate-400 hover:bg-white/[0.04] transition-colors"
            aria-label="Dismiss tip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Header bar ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          {/* Section badge */}
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${section.bg} ${section.color}`}>
            {section.label}
          </span>
          {/* Type badge */}
          <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-white/[0.06] text-slate-300">
            {qtype.label}
          </span>
          {/* Difficulty badge */}
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${diff.bg} ${diff.color}`}>
            {diff.label}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Question counter */}
          <span className="text-sm text-slate-500">
            Question <span className="text-white font-medium">{questionNumber}</span> of {totalQuestions}
          </span>
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm ${
            timerDanger ? 'bg-red-500/10 text-red-400' :
            timerWarning ? 'bg-amber-500/10 text-amber-400' :
            'bg-white/[0.04] text-slate-400'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            {timerStr}
          </div>
        </div>
      </div>

      {/* ── Question body ──────────────────────────── */}
      {question.type === 'PS' && (
        <PSBody question={question} selected={selected} onSelect={setSelected} disabled={disabled} />
      )}
      {question.type === 'DS' && (
        <DSBody question={question} selected={selected} onSelect={setSelected} disabled={disabled} />
      )}
      {question.type === 'CR' && (
        <CRBody question={question} selected={selected} onSelect={setSelected} disabled={disabled} />
      )}
      {question.type === 'RC' && (
        <RCBody question={question} selected={selected} onSelect={setSelected} disabled={disabled} />
      )}

      {/* ── Submit button ──────────────────────────── */}
      {!disabled && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className={`px-8 py-3 rounded-xl font-medium text-sm transition-all
              ${selected
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-[#1E293B] text-slate-600 cursor-not-allowed'
              }
            `}
          >
            Confirm Answer
          </button>
        </div>
      )}
    </div>
  )
}

// ── Problem Solving ────────────────────────────────────────

function PSBody({ question, selected, onSelect, disabled }: {
  question: Extract<GmatQuestion, { type: 'PS' }>
  selected: string | null
  onSelect: (id: string) => void
  disabled: boolean
}) {
  return (
    <div>
      <p className="text-[15px] text-slate-100 leading-relaxed mb-6 whitespace-pre-wrap">
        {question.text}
      </p>
      <OptionsList options={question.options} selected={selected} onSelect={onSelect} disabled={disabled} />
    </div>
  )
}

// ── Data Sufficiency ───────────────────────────────────────

function DSBody({ question, selected, onSelect, disabled }: {
  question: Extract<GmatQuestion, { type: 'DS' }>
  selected: string | null
  onSelect: (id: string) => void
  disabled: boolean
}) {
  return (
    <div>
      <p className="text-[15px] text-slate-100 leading-relaxed mb-5 whitespace-pre-wrap">
        {question.text}
      </p>

      {/* Statements */}
      <div className="space-y-3 mb-6">
        <div className="bg-[#151C2C] border border-white/[0.06] rounded-xl px-5 py-4">
          <span className="text-xs text-cyan-400 font-semibold mr-2">(1)</span>
          <span className="text-sm text-slate-200">{question.statement1}</span>
        </div>
        <div className="bg-[#151C2C] border border-white/[0.06] rounded-xl px-5 py-4">
          <span className="text-xs text-cyan-400 font-semibold mr-2">(2)</span>
          <span className="text-sm text-slate-200">{question.statement2}</span>
        </div>
      </div>

      <OptionsList options={DS_OPTIONS} selected={selected} onSelect={onSelect} disabled={disabled} compact />
    </div>
  )
}

// ── Critical Reasoning ─────────────────────────────────────

function CRBody({ question, selected, onSelect, disabled }: {
  question: Extract<GmatQuestion, { type: 'CR' }>
  selected: string | null
  onSelect: (id: string) => void
  disabled: boolean
}) {
  return (
    <div>
      {/* Passage */}
      <div className="bg-[#151C2C] border border-white/[0.06] rounded-xl px-6 py-5 mb-5">
        <p className="text-[14px] text-slate-300 leading-relaxed italic">
          {question.passage}
        </p>
      </div>

      {/* Question stem */}
      <p className="text-[15px] text-slate-100 leading-relaxed mb-6 font-medium">
        {question.questionStem}
      </p>

      <OptionsList options={question.options} selected={selected} onSelect={onSelect} disabled={disabled} />
    </div>
  )
}

// ── Reading Comprehension ──────────────────────────────────

function RCBody({ question, selected, onSelect, disabled }: {
  question: Extract<GmatQuestion, { type: 'RC' }>
  selected: string | null
  onSelect: (id: string) => void
  disabled: boolean
}) {
  const [currentQ, setCurrentQ] = useState(0)
  const q = question.questions[currentQ]
  if (!q) return null

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Passage */}
      <div className="bg-[#151C2C] border border-white/[0.06] rounded-xl px-6 py-5 max-h-[500px] overflow-y-auto">
        {question.passageTitle && (
          <h3 className="text-white font-semibold mb-3 text-sm">{question.passageTitle}</h3>
        )}
        <p className="text-[14px] text-slate-300 leading-relaxed whitespace-pre-wrap">
          {question.passage}
        </p>
      </div>

      {/* Questions */}
      <div>
        {question.questions.length > 1 && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="text-xs text-slate-500 hover:text-white disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="text-xs text-slate-500">
              Q{currentQ + 1} of {question.questions.length}
            </span>
            <button
              onClick={() => setCurrentQ(Math.min(question.questions.length - 1, currentQ + 1))}
              disabled={currentQ === question.questions.length - 1}
              className="text-xs text-slate-500 hover:text-white disabled:opacity-30 flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <p className="text-[15px] text-slate-100 leading-relaxed mb-5 font-medium">
          {q.questionStem}
        </p>
        <OptionsList options={q.options} selected={selected} onSelect={onSelect} disabled={disabled} />
      </div>
    </div>
  )
}

// ── Options List (shared) ──────────────────────────────────

function OptionsList({ options, selected, onSelect, disabled, compact }: {
  options: AnswerOption[]
  selected: string | null
  onSelect: (id: string) => void
  disabled: boolean
  compact?: boolean
}) {
  return (
    <div className="space-y-2">
      {options.map(opt => {
        const isSelected = selected === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => !disabled && onSelect(opt.id)}
            disabled={disabled}
            className={`
              w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all
              ${isSelected
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-white/[0.06] bg-[#0D1220] hover:border-[#283244] hover:bg-[#0F1525]'
              }
              ${disabled ? 'cursor-default' : 'cursor-pointer'}
            `}
          >
            {/* Letter circle */}
            <span className={`
              shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5
              ${isSelected
                ? 'bg-cyan-500 text-white'
                : 'bg-white/[0.06] text-slate-400'
              }
            `}>
              {opt.id}
            </span>
            {/* Option text */}
            <span className={`text-sm leading-relaxed ${compact ? '' : ''} ${
              isSelected ? 'text-white' : 'text-slate-300'
            }`}>
              {opt.text}
            </span>
          </button>
        )
      })}
    </div>
  )
}
