'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Target, BarChart3, Play, AlertCircle } from 'lucide-react'
import { GMAT_SECTIONS } from '@/lib/gmat/topics'
import {
  SAMPLE_QUESTIONS,
  type GmatQuestion,
  type Section,
  SECTION_META,
  TYPE_META,
  DIFFICULTY_META,
} from '@/lib/gmat/question-types'
import { QuestionCard } from '@/components/practice/QuestionCard'
import { ExplanationPanel } from '@/components/practice/ExplanationPanel'
import { PracticeSummary } from '@/components/practice/PracticeSummary'

type Mode = null | 'full' | 'section'
type TestState = 'setup' | 'testing' | 'explanation' | 'summary'

interface AnswerRecord {
  question: GmatQuestion
  userAnswer: string
  timeTaken: number
  correct: boolean
}

export default function MockTestPage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<Mode>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [testState, setTestState] = useState<TestState>('setup')
  const [questions, setQuestions] = useState<GmatQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [currentUserAnswer, setCurrentUserAnswer] = useState<string | null>(null)
  const [currentTimeTaken, setCurrentTimeTaken] = useState(0)
  const [startTime, setStartTime] = useState(0)

  const startTest = () => {
    let pool = [...SAMPLE_QUESTIONS]

    if (selectedMode === 'section' && selectedSection) {
      pool = pool.filter(q => q.section === selectedSection)
    }

    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]]
    }

    // For full test take all available, for section take up to 10
    const count = selectedMode === 'full' ? Math.min(pool.length, 20) : Math.min(pool.length, 10)
    setQuestions(pool.slice(0, count))
    setCurrentIndex(0)
    setAnswers([])
    setCurrentUserAnswer(null)
    setTestState('testing')
    setStartTime(Date.now())
  }

  const handleSubmitAnswer = (answerId: string, timeTaken: number) => {
    const q = questions[currentIndex]
    if (!q) return

    const correctAnswer = q.type === 'RC' ? q.questions[0]?.correctAnswer : (q as any).correctAnswer
    const correct = answerId === correctAnswer

    setCurrentUserAnswer(answerId)
    setCurrentTimeTaken(timeTaken)
    setAnswers(prev => [...prev, { question: q, userAnswer: answerId, timeTaken, correct }])
    setTestState('explanation')
  }

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setTestState('summary')
    } else {
      setCurrentIndex(prev => prev + 1)
      setCurrentUserAnswer(null)
      setTestState('testing')
    }
  }

  const currentQuestion = questions[currentIndex]
  const totalTime = Math.floor((Date.now() - startTime) / 1000)
  const progressPct = questions.length > 0
    ? Math.round(((testState === 'explanation' ? currentIndex + 1 : currentIndex) / questions.length) * 100)
    : 0

  // ── Summary ────────────────────────────────────────────

  if (testState === 'summary') {
    return (
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        <PracticeSummary
          answers={answers}
          totalTime={totalTime}
          onReviewMistakes={() => {}}
          onNewPractice={() => {
            setTestState('setup')
            setSelectedMode(null)
            setSelectedSection(null)
          }}
          onAskSam={() => {
            const summary = `Mock test: ${answers.length} questions, ${answers.filter(a => a.correct).length} correct.`
            router.push(`/dashboard/session?context=${encodeURIComponent(summary)}`)
          }}
        />
      </div>
    )
  }

  // ── Testing ────────────────────────────────────────────

  if (testState === 'testing' || testState === 'explanation') {
    if (!currentQuestion) return null

    return (
      <div className="max-w-3xl mx-auto p-6 lg:p-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => { setTestState('setup'); setSelectedMode(null) }}
              className="text-sm text-slate-500 hover:text-slate-300"
            >
              ← End test
            </button>
            <span className="text-xs text-slate-500">
              {answers.filter(a => a.correct).length}/{answers.length} correct
              {selectedMode === 'full' ? ' · Full Mock Test' : ` · ${GMAT_SECTIONS.find(s => s.id === selectedSection)?.name || 'Section'}`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#151C2C] rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="glass-card p-6 lg:p-8">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onSubmit={handleSubmitAnswer}
            timedMode={true}
            disabled={testState === 'explanation'}
          />

          {testState === 'explanation' && currentUserAnswer && (
            <ExplanationPanel
              question={currentQuestion}
              userAnswer={currentUserAnswer}
              timeTaken={currentTimeTaken}
              onNext={handleNext}
              onAskSam={() => {
                const q = currentQuestion
                const context = encodeURIComponent(`Mock test question about ${q.topic}. Can you explain?`)
                router.push(`/dashboard/session?context=${context}`)
              }}
            />
          )}
        </div>
      </div>
    )
  }

  // ── Setup ──────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Mock Test</h1>
        <p className="text-slate-400 mt-1">
          Take a full-length GMAT practice test or practice individual sections
        </p>
      </div>

      {/* Test mode selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Full Test */}
        <div
          onClick={() => { setSelectedMode('full'); setSelectedSection(null) }}
          className={`p-6 rounded-xl border cursor-pointer transition-all ${
            selectedMode === 'full'
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-white/[0.06] bg-[#0D1220] hover:border-[#283244]'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Full Mock Test</h3>
              <p className="text-xs text-slate-500">2 hours 15 minutes · All 3 sections</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Simulate the real GMAT experience. Includes Quant, Verbal, and Data Insights
            sections with adaptive difficulty.
          </p>
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 135 min</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> 64 questions</span>
          </div>
        </div>

        {/* Section Practice */}
        <div
          onClick={() => setSelectedMode('section')}
          className={`p-6 rounded-xl border cursor-pointer transition-all ${
            selectedMode === 'section'
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-white/[0.06] bg-[#0D1220] hover:border-[#283244]'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Section Practice</h3>
              <p className="text-xs text-slate-500">45 minutes · One section at a time</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Focus on a single section. Great for targeted improvement on your weakest area.
          </p>
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 45 min</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> 20-23 questions</span>
          </div>
        </div>
      </div>

      {/* Section selection */}
      {selectedMode === 'section' && (
        <div className="bg-[#0D1220] rounded-xl border border-white/[0.06] p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Choose a Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GMAT_SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  selectedSection === section.id
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-[#283244] bg-[#1E293B]/50 hover:border-cyan-500/50'
                }`}
              >
                <div className="text-white font-medium text-sm">{section.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {section.timeMinutes} min · {section.questionCount} questions
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start button */}
      {selectedMode && (selectedMode === 'full' || selectedSection) && (
        <div className="text-center">
          <button
            onClick={startTest}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3.5 text-base font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            <Play className="w-5 h-5" />
            {selectedMode === 'full' ? 'Start Full Mock Test' : 'Start Section Practice'}
          </button>
          <p className="text-xs text-slate-500 mt-3">
            Timed mode · Questions from sample bank ({SAMPLE_QUESTIONS.length} available)
          </p>
        </div>
      )}

      {/* Info notice */}
      {!selectedMode && (
        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-400">
              Select a test mode above to begin. Questions are drawn from the practice bank and presented in timed mode to simulate real exam conditions.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
