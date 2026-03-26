'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Target, BarChart3, Play, AlertCircle } from 'lucide-react'
import { GMAT_SECTIONS } from '@/lib/gmat/topics'
import {
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
  const [isLoading, setIsLoading] = useState(false)

  // Section-based state for full mock test
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [sectionBreaks, setSectionBreaks] = useState<number[]>([]) // indices where new sections start
  const [sectionTimerEnd, setSectionTimerEnd] = useState(0) // timestamp when current section expires
  const [sectionTimeLeft, setSectionTimeLeft] = useState('') // formatted time remaining

  // Section timer effect
  const updateTimer = useCallback(() => {
    if (sectionTimerEnd <= 0) return
    const remaining = Math.max(0, Math.floor((sectionTimerEnd - Date.now()) / 1000))
    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60
    setSectionTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`)
  }, [sectionTimerEnd])

  // Tick the timer every second
  useEffect(() => {
    if (sectionTimerEnd <= 0) return
    const interval = setInterval(updateTimer, 1000)
    updateTimer() // run immediately
    return () => clearInterval(interval)
  }, [sectionTimerEnd, updateTimer])

  const startTest = async () => {
    setIsLoading(true)
    try {
      let allQuestions: GmatQuestion[] = []
      const breaks: number[] = [0]

      if (selectedMode === 'full') {
        // Full test: 21 quant + 23 verbal + 20 DI
        const sections: { section: Section; count: number }[] = [
          { section: 'quant', count: 21 },
          { section: 'verbal', count: 23 },
          { section: 'data-insights', count: 20 },
        ]

        for (const { section, count } of sections) {
          const params = new URLSearchParams({ section, limit: String(count) })
          try {
            const res = await fetch(`/api/practice/questions?${params}`)
            if (res.ok) {
              const data = await res.json()
              const fetched = data.questions as GmatQuestion[]
              if (allQuestions.length > 0 && fetched.length > 0) {
                breaks.push(allQuestions.length) // mark section boundary
              }
              allQuestions.push(...fetched)
            }
          } catch {
            // Section failed to load — continue with what we have
          }
        }
      } else if (selectedMode === 'section' && selectedSection) {
        // Section practice: fetch the correct count for the section
        const sectionInfo = GMAT_SECTIONS.find(s => s.id === selectedSection)
        const count = sectionInfo?.questionCount ?? 20
        const params = new URLSearchParams({
          section: selectedSection,
          limit: String(count),
        })
        try {
          const res = await fetch(`/api/practice/questions?${params}`)
          if (res.ok) {
            const data = await res.json()
            allQuestions = data.questions as GmatQuestion[]
          }
        } catch {
          // Fetch failed
        }
      }

      if (allQuestions.length === 0) {
        setIsLoading(false)
        return
      }

      setQuestions(allQuestions)
      setSectionBreaks(breaks)
      setCurrentSectionIndex(0)
      setCurrentIndex(0)
      setAnswers([])
      setCurrentUserAnswer(null)
      setTestState('testing')
      setStartTime(Date.now())
      // Start 45 minute section timer
      setSectionTimerEnd(Date.now() + 45 * 60 * 1000)
    } finally {
      setIsLoading(false)
    }
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

  // Determine which section the current question belongs to
  const getCurrentSectionName = (): string => {
    if (!questions[currentIndex]) return ''
    const section = questions[currentIndex].section
    return SECTION_META[section]?.label ?? section
  }

  const handleNext = () => {
    const nextIdx = currentIndex + 1
    if (nextIdx >= questions.length) {
      setTestState('summary')
      return
    }

    // Check if we're crossing a section boundary (full mock test)
    if (selectedMode === 'full' && sectionBreaks.includes(nextIdx)) {
      // Reset section timer for the new section
      setSectionTimerEnd(Date.now() + 45 * 60 * 1000)
      setCurrentSectionIndex(prev => prev + 1)
    }

    setCurrentIndex(nextIdx)
    setCurrentUserAnswer(null)
    setTestState('testing')
  }

  const currentQuestion = questions[currentIndex]
  const totalTime = Math.floor((Date.now() - startTime) / 1000)
  const progressPct = questions.length > 0
    ? Math.round(((testState === 'explanation' ? currentIndex + 1 : currentIndex) / questions.length) * 100)
    : 0

  // ── Summary ────────────────────────────────────────────

  if (testState === 'summary') {
    return (
      <div className="min-h-full max-w-4xl mx-auto p-6 lg:p-8">
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
        {/* Section timer + Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => { setTestState('setup'); setSelectedMode(null) }}
              className="text-sm text-slate-500 hover:text-slate-300"
            >
              ← End test
            </button>
            <div className="flex items-center gap-4">
              {sectionTimerEnd > 0 && (
                <span className="flex items-center gap-1 text-xs font-mono text-amber-400">
                  <Clock className="w-3 h-3" />
                  {sectionTimeLeft}
                </span>
              )}
              {selectedMode === 'full' && (
                <span className="text-xs text-cyan-400 font-medium">
                  {getCurrentSectionName()}
                </span>
              )}
              <span className="text-xs text-slate-500">
                {answers.filter(a => a.correct).length}/{answers.length} correct
                {selectedMode === 'full' ? ' · Full Mock Test' : ` · ${GMAT_SECTIONS.find(s => s.id === selectedSection)?.name || 'Section'}`}
              </span>
            </div>
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
    <div className="min-h-full max-w-4xl mx-auto p-6 lg:p-8">
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
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white px-8 py-3.5 text-base font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading questions…
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {selectedMode === 'full' ? 'Start Full Mock Test' : 'Start Section Practice'}
              </>
            )}
          </button>
          <p className="text-xs text-slate-500 mt-3">
            Timed mode · Questions from the question bank
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
