'use client'

import { useMemo } from 'react'
import { Trophy, Clock, Target, TrendingUp, AlertTriangle, RotateCcw, Mic, BookOpen } from 'lucide-react'
import type { GmatQuestion, QuestionType, Section } from '@/lib/gmat/question-types'
import { SECTION_META, TYPE_META } from '@/lib/gmat/question-types'

interface AnswerRecord {
  question: GmatQuestion
  userAnswer: string
  timeTaken: number
  correct: boolean
}

interface Props {
  answers: AnswerRecord[]
  totalTime: number
  onReviewMistakes: () => void
  onNewPractice: () => void
  onAskSam: () => void
}

export function PracticeSummary({ answers, totalTime, onReviewMistakes, onNewPractice, onAskSam }: Props) {
  const stats = useMemo(() => {
    const total = answers.length
    const correct = answers.filter(a => a.correct).length
    const accuracy = total > 0 ? correct / total : 0
    const avgTime = total > 0 ? Math.round(answers.reduce((s, a) => s + a.timeTaken, 0) / total) : 0
    const mistakes = answers.filter(a => !a.correct)

    // Breakdown by section
    const bySectionMap: Record<string, { total: number; correct: number }> = {}
    for (const a of answers) {
      const key = a.question.section
      if (!bySectionMap[key]) bySectionMap[key] = { total: 0, correct: 0 }
      bySectionMap[key].total++
      if (a.correct) bySectionMap[key].correct++
    }

    // Breakdown by type
    const byTypeMap: Record<string, { total: number; correct: number }> = {}
    for (const a of answers) {
      const key = a.question.type
      if (!byTypeMap[key]) byTypeMap[key] = { total: 0, correct: 0 }
      byTypeMap[key].total++
      if (a.correct) byTypeMap[key].correct++
    }

    // Weakest topics
    const byTopic: Record<string, { total: number; correct: number; section: Section }> = {}
    for (const a of answers) {
      const key = a.question.topic
      if (!byTopic[key]) byTopic[key] = { total: 0, correct: 0, section: a.question.section }
      byTopic[key].total++
      if (a.correct) byTopic[key].correct++
    }
    const weakest = Object.entries(byTopic)
      .map(([topic, s]) => ({ topic, accuracy: s.total > 0 ? s.correct / s.total : 0, ...s }))
      .filter(t => t.accuracy < 0.7 && t.total >= 2)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3)

    return { total, correct, accuracy, avgTime, mistakes, bySectionMap, byTypeMap, weakest }
  }, [answers])

  const mins = Math.floor(totalTime / 60)
  const secs = totalTime % 60

  // Score color
  const scoreColor = stats.accuracy >= 0.8 ? 'text-emerald-400'
    : stats.accuracy >= 0.6 ? 'text-cyan-400'
    : stats.accuracy >= 0.4 ? 'text-amber-400'
    : 'text-red-400'

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <Trophy className={`w-12 h-12 mx-auto mb-3 ${scoreColor}`} />
        <h1 className="text-2xl font-bold text-white mb-1">Practice Complete</h1>
        <p className="text-slate-400">Here's how you did</p>
      </div>

      {/* Score card */}
      <div className="glass-card p-6 mb-6">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className={`text-3xl font-bold ${scoreColor}`}>
              {Math.round(stats.accuracy * 100)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">
              {stats.correct}/{stats.total}
            </div>
            <div className="text-xs text-slate-500 mt-1">Correct</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">
              {mins > 0 ? `${mins}m` : `${secs}s`}
            </div>
            <div className="text-xs text-slate-500 mt-1">Total Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">
              {stats.avgTime}s
            </div>
            <div className="text-xs text-slate-500 mt-1">Avg/Question</div>
          </div>
        </div>
      </div>

      {/* Section breakdown */}
      {Object.keys(stats.bySectionMap).length > 0 && (
        <div className="glass-card p-6 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            By Section
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.bySectionMap).map(([sec, s]) => {
              const meta = SECTION_META[sec as Section]
              const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
              return (
                <div key={sec} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${meta?.bg} ${meta?.color}`}>
                    {meta?.label || sec}
                  </span>
                  <div className="flex-1 h-2 bg-[#151C2C] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-cyan-400' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-16 text-right">
                    {s.correct}/{s.total} ({pct}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Type breakdown */}
      {Object.keys(stats.byTypeMap).length > 0 && (
        <div className="glass-card p-6 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            By Question Type
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.byTypeMap).map(([type, s]) => {
              const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
              const meta = TYPE_META[type as QuestionType]
              return (
                <div key={type} className="bg-[#151C2C] rounded-xl px-4 py-3 min-w-[100px]">
                  <div className="text-xs text-slate-500">{meta?.label}</div>
                  <div className={`text-lg font-bold ${
                    pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-cyan-400' : 'text-amber-400'
                  }`}>{pct}%</div>
                  <div className="text-[10px] text-slate-600">{s.correct}/{s.total}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Weak topics */}
      {stats.weakest.length > 0 && (
        <div className="glass-card p-6 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Areas to Improve
          </h3>
          <div className="space-y-2">
            {stats.weakest.map(t => (
              <div key={t.topic} className="flex items-center justify-between text-sm">
                <span className="text-slate-300 capitalize">{t.topic.replace(/-/g, ' ')}</span>
                <span className={`font-medium ${
                  t.accuracy >= 0.5 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {Math.round(t.accuracy * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {stats.mistakes.length > 0 && (
          <button
            onClick={onReviewMistakes}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 transition-all text-sm font-medium"
          >
            <BookOpen className="w-4 h-4" />
            Review {stats.mistakes.length} Mistake{stats.mistakes.length > 1 ? 's' : ''}
          </button>
        )}
        <div className="flex gap-3">
          <button
            onClick={onAskSam}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-medium"
          >
            <Mic className="w-4 h-4" />
            Ask Sam to review
          </button>
          <button
            onClick={onNewPractice}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            New Practice
          </button>
        </div>
      </div>
    </div>
  )
}
