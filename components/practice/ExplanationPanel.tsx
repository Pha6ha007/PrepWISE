'use client'

import { CheckCircle, XCircle, Mic, ArrowRight, Clock, Lightbulb } from 'lucide-react'
import type { GmatQuestion, AnswerOption } from '@/lib/gmat/question-types'
import { DS_OPTIONS } from '@/lib/gmat/question-types'
import { AudioExplanation } from './AudioExplanation'

interface Props {
  question: GmatQuestion
  userAnswer: string
  timeTaken: number
  onNext: () => void
  onAskSam: () => void
}

export function ExplanationPanel({ question, userAnswer, timeTaken, onNext, onAskSam }: Props) {
  const correctAnswer = question.type === 'RC'
    ? question.questions?.[0]?.correctAnswer || ''
    : (question as any).correctAnswer || ''
  const isCorrect = userAnswer === correctAnswer

  // Get the options list depending on type
  const options: AnswerOption[] = question.type === 'DS'
    ? DS_OPTIONS
    : question.type === 'RC'
    ? question.questions?.[0]?.options || []
    : (question as any).options || []

  const correctOption = options.find(o => o.id === correctAnswer)
  const userOption = options.find(o => o.id === userAnswer)

  // Get explanation
  const explanation = question.type === 'RC'
    ? question.questions?.[0]?.explanation || ''
    : (question as any).explanation || ''

  const mins = Math.floor(timeTaken / 60)
  const secs = timeTaken % 60

  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      {/* Result banner */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${
        isCorrect
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : 'bg-red-500/10 border-red-500/20'
      }`}>
        {isCorrect ? (
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-red-400 shrink-0" />
        )}
        <div className="flex-1">
          <p className={`font-semibold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </p>
          {!isCorrect && (
            <p className="text-sm text-slate-400 mt-0.5">
              Your answer: <span className="text-red-300 font-medium">{userAnswer}</span>
              {' · '}
              Correct answer: <span className="text-emerald-300 font-medium">{correctAnswer}</span>
              {correctOption && (
                <span className="text-slate-500"> — {correctOption.text.slice(0, 60)}{correctOption.text.length > 60 ? '...' : ''}</span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
        </div>
      </div>

      {/* Answer options — colored */}
      <div className="space-y-1.5">
        {options.map(opt => {
          const isUserChoice = opt.id === userAnswer
          const isCorrectChoice = opt.id === correctAnswer

          let borderClass = 'border-transparent'
          let bgClass = 'bg-transparent'
          let textClass = 'text-slate-500'

          if (isCorrectChoice) {
            borderClass = 'border-emerald-500/30'
            bgClass = 'bg-emerald-500/5'
            textClass = 'text-emerald-300'
          } else if (isUserChoice && !isCorrect) {
            borderClass = 'border-red-500/30'
            bgClass = 'bg-red-500/5'
            textClass = 'text-red-300'
          }

          return (
            <div
              key={opt.id}
              className={`flex items-start gap-3 px-4 py-2.5 rounded-lg border ${borderClass} ${bgClass}`}
            >
              <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                isCorrectChoice ? 'bg-emerald-500 text-white' :
                isUserChoice && !isCorrect ? 'bg-red-500 text-white' :
                'bg-white/[0.06] text-slate-500'
              }`}>
                {opt.id}
              </span>
              <span className={`text-sm ${textClass}`}>{opt.text}</span>
              {isCorrectChoice && (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-auto mt-0.5" />
              )}
              {isUserChoice && !isCorrect && (
                <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-auto mt-0.5" />
              )}
            </div>
          )
        })}
      </div>

      {/* Explanation */}
      <div className="bg-[#151C2C] border border-white/[0.06] rounded-xl px-6 py-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Explanation</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          {explanation}
        </p>

        {/* Audio explanation — TTS via Sam */}
        {explanation && <AudioExplanation explanationText={explanation} />}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onAskSam}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-medium"
        >
          <Mic className="w-4 h-4" />
          Ask Sam to explain
        </button>
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all text-sm font-medium"
        >
          Next Question
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
