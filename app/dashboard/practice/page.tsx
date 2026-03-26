'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PracticeSetup } from '@/components/practice/PracticeSetup'
import { QuestionCard } from '@/components/practice/QuestionCard'
import { ExplanationPanel } from '@/components/practice/ExplanationPanel'
import { PracticeSummary } from '@/components/practice/PracticeSummary'
import { SelfRatingButtons } from '@/components/practice/SelfRatingButtons'
import { SmartReviewPanel } from '@/components/practice/SmartReviewPanel'
import {
  type GmatQuestion,
  type Section,
  type QuestionType,
  type Difficulty,
} from '@/lib/gmat/question-types'
import type { ReviewCard, ReviewSchedule } from '@/lib/gmat/spaced-repetition'

type PracticeState = 'setup' | 'practicing' | 'explanation' | 'summary' | 'review-mistakes'

interface PracticeConfig {
  sections: Section[]
  questionTypes: QuestionType[]
  difficulty: Difficulty | 'all'
  questionCount: number
  timed: boolean
}

interface AnswerRecord {
  question: GmatQuestion
  userAnswer: string
  timeTaken: number
  correct: boolean
}

export default function PracticePage() {
  const router = useRouter()
  const [state, setState] = useState<PracticeState>('setup')
  const [config, setConfig] = useState<PracticeConfig | null>(null)
  const [questions, setQuestions] = useState<GmatQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [currentUserAnswer, setCurrentUserAnswer] = useState<string | null>(null)
  const [currentTimeTaken, setCurrentTimeTaken] = useState(0)
  const [reviewSchedule, setReviewSchedule] = useState<ReviewSchedule | null>(null)
  const [reviewMistakeIndex, setReviewMistakeIndex] = useState(0)
  const sessionStartTime = useRef(Date.now())

  // Fetch FSRS review schedule on mount
  useEffect(() => {
    fetchReviewSchedule()
  }, [])

  const fetchReviewSchedule = async () => {
    try {
      const res = await fetch('/api/review')
      if (res.ok) {
        const data = await res.json()
        setReviewSchedule(data.schedule)
      }
    } catch { /* no schedule */ }
  }

  const [isLoading, setIsLoading] = useState(false)

  // Fetch questions from API based on config
  const fetchQuestions = useCallback(async (cfg: PracticeConfig): Promise<GmatQuestion[]> => {
    // Build requests for each section+type combo
    const fetches: Promise<GmatQuestion[]>[] = []

    for (const section of cfg.sections) {
      const types = cfg.questionTypes.filter(t => {
        // Only request types that belong to this section
        const quantTypes = ['PS', 'DS']
        const verbalTypes = ['CR', 'RC']
        const diTypes = ['TPA', 'MSR', 'GI', 'DS']
        if (section === 'quant') return quantTypes.includes(t)
        if (section === 'verbal') return verbalTypes.includes(t)
        if (section === 'data-insights') return diTypes.includes(t)
        return false
      })

      for (const type of types) {
        const params = new URLSearchParams({
          section,
          type,
          limit: String(cfg.questionCount),
        })
        if (cfg.difficulty !== 'all') {
          params.set('difficulty', cfg.difficulty)
        }

        fetches.push(
          fetch(`/api/practice/questions?${params}`)
            .then(res => res.ok ? res.json() : { questions: [] })
            .then(data => data.questions as GmatQuestion[])
            .catch(() => [] as GmatQuestion[])
        )
      }
    }

    const results = await Promise.all(fetches)
    let pool = results.flat()

    // Shuffle combined pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]]
    }

    return pool.slice(0, cfg.questionCount)
  }, [])

  const handleStart = useCallback(async (cfg: PracticeConfig) => {
    setIsLoading(true)
    setConfig(cfg)
    try {
      const selected = await fetchQuestions(cfg)
      setQuestions(selected)
      setCurrentIndex(0)
      setAnswers([])
      setCurrentUserAnswer(null)
      setState('practicing')
      sessionStartTime.current = Date.now()
    } catch {
      // If fetch fails completely, stay on setup
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }, [fetchQuestions])

  const handleSubmitAnswer = useCallback((answerId: string, timeTaken: number) => {
    const q = questions[currentIndex]
    if (!q) return

    const correct = q.type === 'RC'
      ? answerId === q.questions[0]?.correctAnswer
      : answerId === (q as any).correctAnswer
    setCurrentUserAnswer(answerId)
    setCurrentTimeTaken(timeTaken)
    setState('explanation')

    setAnswers(prev => [...prev, { question: q, userAnswer: answerId, timeTaken, correct }])

    // Record to FSRS in background
    try {
      fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: q.topic,
          section: q.section,
          accuracy: correct ? (timeTaken < 60 ? 'correct_confident' : 'correct_slow') : 'wrong_concept',
        }),
      }).catch(() => {})
    } catch {}
  }, [questions, currentIndex])

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setState('summary')
    } else {
      setCurrentIndex(prev => prev + 1)
      setCurrentUserAnswer(null)
      setState('practicing')
    }
  }, [currentIndex, questions.length])

  const handleAskSam = useCallback(() => {
    const q = questions[currentIndex]
    if (!q) return
    // Navigate to session with pre-loaded context
    const correctAns = q.type === 'RC' ? q.questions[0]?.correctAnswer : (q as any).correctAnswer
    const context = encodeURIComponent(
      `I just got a ${q.type} question ${currentUserAnswer === correctAns ? 'right' : 'wrong'}. ` +
      `Topic: ${q.topic}. Question: ${(q as any).text || (q as any).questionStem || ''}`
    )
    router.push(`/dashboard/session?context=${context}`)
  }, [questions, currentIndex, currentUserAnswer, router])

  const handleReviewMistakes = useCallback(() => {
    setReviewMistakeIndex(0)
    setState('review-mistakes')
  }, [])

  const mistakes = useMemo(() => answers.filter(a => !a.correct), [answers])

  const currentQuestion = questions[currentIndex]
  const totalTime = Math.floor((Date.now() - sessionStartTime.current) / 1000)

  // Progress percentage
  const progressPct = questions.length > 0
    ? Math.round(((state === 'explanation' ? currentIndex + 1 : currentIndex) / questions.length) * 100)
    : 0

  // ── Setup screen ──────────────────────────────────────────

  if (state === 'setup') {
    return (
      <div className="min-h-full max-w-4xl mx-auto p-6 lg:p-8">
        {/* Smart Review Panel */}
        {reviewSchedule && (
          (reviewSchedule.dueNow?.length > 0 || reviewSchedule.dueToday?.length > 0) && (
            <div className="mb-8">
              <SmartReviewPanel
                schedule={reviewSchedule}
                onStartReview={(card: ReviewCard) => {
                  // Start practice with this topic pre-selected
                  const section = card.section as Section
                  handleStart({
                    sections: [section],
                    questionTypes: section === 'quant' ? ['PS'] : section === 'verbal' ? ['CR', 'RC'] : ['TPA', 'MSR', 'GI', 'DS'],
                    difficulty: 'all',
                    questionCount: 5,
                    timed: false,
                  })
                }}
              />
            </div>
          )
        )}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading questions…</p>
          </div>
        ) : (
          <PracticeSetup onStart={handleStart} />
        )}
      </div>
    )
  }

  // ── Summary screen ────────────────────────────────────────

  if (state === 'summary') {
    return (
      <div className="min-h-full max-w-4xl mx-auto p-6 lg:p-8">
        <PracticeSummary
          answers={answers}
          totalTime={totalTime}
          onReviewMistakes={handleReviewMistakes}
          onNewPractice={() => setState('setup')}
          onAskSam={() => {
            const summary = `I just finished a practice session: ${answers.length} questions, ${answers.filter(a => a.correct).length} correct (${Math.round((answers.filter(a => a.correct).length / answers.length) * 100)}% accuracy).`
            router.push(`/dashboard/session?context=${encodeURIComponent(summary)}`)
          }}
        />
      </div>
    )
  }

  // ── Review mistakes ───────────────────────────────────────

  if (state === 'review-mistakes') {
    const mistake = mistakes[reviewMistakeIndex]
    if (!mistake) {
      setState('summary')
      return null
    }

    return (
      <div className="max-w-3xl mx-auto p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => setState('summary')} className="text-sm text-slate-500 hover:text-slate-300 mb-1">
              ← Back to summary
            </button>
            <h1 className="text-lg font-bold text-white">Reviewing Mistakes</h1>
            <p className="text-xs text-slate-500">{reviewMistakeIndex + 1} of {mistakes.length}</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <QuestionCard
            question={mistake.question}
            questionNumber={reviewMistakeIndex + 1}
            totalQuestions={mistakes.length}
            onSubmit={() => {}}
            disabled
          />
          <ExplanationPanel
            question={mistake.question}
            userAnswer={mistake.userAnswer}
            timeTaken={mistake.timeTaken}
            onNext={() => {
              if (reviewMistakeIndex + 1 >= mistakes.length) {
                setState('summary')
              } else {
                setReviewMistakeIndex(prev => prev + 1)
              }
            }}
            onAskSam={() => {
              const q = mistake.question
              const context = encodeURIComponent(
                `I got this ${q.type} question wrong. Topic: ${q.topic}. Can you explain it?`
              )
              router.push(`/dashboard/session?context=${context}`)
            }}
          />
        </div>
      </div>
    )
  }

  // ── Practice / Explanation screen ─────────────────────────

  if (!currentQuestion) return null

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setState('setup')} className="text-sm text-slate-500 hover:text-slate-300">
            ← End practice
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">
              {answers.filter(a => a.correct).length}/{answers.length} correct
            </span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-[#151C2C] rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="glass-card p-6 lg:p-8">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onSubmit={handleSubmitAnswer}
          timedMode={config?.timed}
          disabled={state === 'explanation'}
        />

        {/* Explanation (after submission) */}
        {state === 'explanation' && currentUserAnswer && (
          <ExplanationPanel
            question={currentQuestion}
            userAnswer={currentUserAnswer}
            timeTaken={currentTimeTaken}
            onNext={handleNext}
            onAskSam={handleAskSam}
          />
        )}
      </div>
    </div>
  )
}
