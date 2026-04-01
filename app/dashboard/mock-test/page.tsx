'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock, Target, BarChart3, Play, BookmarkIcon, ChevronLeft,
  ChevronRight, AlertCircle, CheckCircle2, Coffee, History,
} from 'lucide-react'
import Link from 'next/link'
import { GMAT_SECTIONS } from '@/lib/gmat/topics'
import {
  type GmatQuestion,
  type Section,
  SECTION_META,
} from '@/lib/gmat/question-types'
import {
  type MockTestSession,
  type MockTestSection,
  type MockTestQuestion,
  type ScoreReport,
  createMockTest,
  selectNextQuestion,
  submitAnswer,
  bookmarkQuestion,
  changeAnswer,
  generateScoreReport,
  serializeSession,
} from '@/lib/gmat/mock-test-engine'
import { QuestionCard } from '@/components/practice/QuestionCard'
import ScoreReportComponent from '@/components/mock-test/ScoreReport'

// ── Types ──────────────────────────────────────────────────

type PageState =
  | 'setup'          // choose full / section
  | 'break'          // 10-min optional break between sections
  | 'section-intro'  // "You are about to start Verbal Reasoning"
  | 'testing'        // active question
  | 'review'         // Review & Edit — see all questions in section
  | 'section-done'   // "Section complete" — next section or finish
  | 'report'         // final ScoreReport

// ── Constants ─────────────────────────────────────────────

const SECTION_TIME = 45 * 60  // 45 minutes per section in seconds
const BREAK_TIME   = 10 * 60  // 10 minutes optional break

const SECTION_NAMES: Record<Section, string> = {
  quant: 'Quantitative Reasoning',
  verbal: 'Verbal Reasoning',
  'data-insights': 'Data Insights',
}

const SECTION_QUESTION_COUNTS: Record<Section, number> = {
  quant: 21,
  verbal: 23,
  'data-insights': 20,
}

// ── Main Page ──────────────────────────────────────────────

export default function MockTestPage() {
  const router = useRouter()

  // Page state machine
  const [pageState, setPageState] = useState<PageState>('setup')
  const [selectedMode, setSelectedMode] = useState<'full' | 'section' | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Test engine state
  const [session, setSession] = useState<MockTestSession | null>(null)
  const [questionPool, setQuestionPool] = useState<GmatQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<MockTestQuestion | null>(null)
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null)  // staged but not submitted
  const [report, setReport] = useState<ScoreReport | null>(null)

  // Timer state
  const [timeLeft, setTimeLeft] = useState(SECTION_TIME)
  const [breakTimeLeft, setBreakTimeLeft] = useState(BREAK_TIME)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const questionStartTime = useRef(Date.now())

  // Review mode state
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0)

  // ── Helpers ──────────────────────────────────────────────

  const currentSection = session
    ? session.sections[session.currentSectionIndex]
    : null

  const currentSectionIndex = session?.currentSectionIndex ?? 0

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ── Fetch question pool for section(s) ───────────────────

  const fetchQuestionPool = useCallback(async (mode: 'full' | 'section', section?: Section) => {
    const sections: Section[] = mode === 'full'
      ? ['quant', 'verbal', 'data-insights']
      : [section!]

    const pools: GmatQuestion[] = []
    for (const sec of sections) {
      const count = SECTION_QUESTION_COUNTS[sec] * 3  // 3× buffer for adaptive selection
      const res = await fetch(`/api/practice/questions?section=${sec}&limit=${count}`)
      if (res.ok) {
        const data = await res.json()
        pools.push(...(data.questions as GmatQuestion[]))
      }
    }
    return pools
  }, [])

  // ── Timer management ─────────────────────────────────────

  const startSectionTimer = useCallback((seconds: number) => {
    setTimeLeft(seconds)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Auto-advance when section timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && pageState === 'testing') {
      handleFinishSection()
    }
  }, [timeLeft, pageState])

  // Break timer
  useEffect(() => {
    if (pageState !== 'break') return
    setBreakTimeLeft(BREAK_TIME)
    const interval = setInterval(() => {
      setBreakTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          handleBreakEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [pageState])

  // Cleanup on unmount
  useEffect(() => () => stopTimer(), [stopTimer])

  // ── Start test ───────────────────────────────────────────

  const handleStart = async () => {
    if (!selectedMode) return
    if (selectedMode === 'section' && !selectedSection) return

    setIsLoading(true)
    try {
      const pool = await fetchQuestionPool(selectedMode, selectedSection ?? undefined)
      setQuestionPool(pool)

      const sess = createMockTest(
        selectedMode,
        selectedMode === 'section' ? selectedSection! : undefined,
      )
      setSession(sess)
      setPageState('section-intro')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Section intro → start ─────────────────────────────────

  const handleSectionIntroStart = useCallback(() => {
    if (!session) return
    const sec = session.sections[session.currentSectionIndex]
    if (!sec) return

    // Load first question
    const q = selectNextQuestion(session, session.currentSectionIndex, questionPool)
    setCurrentQuestion(q)
    setPendingAnswer(null)
    questionStartTime.current = Date.now()

    startSectionTimer(SECTION_TIME)
    setPageState('testing')
    setSession({ ...session })
  }, [session, questionPool, startSectionTimer])

  // ── Submit answer ─────────────────────────────────────────

  const handleSubmitAnswer = useCallback((answerId: string) => {
    if (!session || !currentSection || !currentQuestion) return

    const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000)

    // Submit to engine — updates adaptive difficulty
    submitAnswer(session, currentQuestion.question.id, answerId, timeTaken)
    setSession({ ...session })
    setPendingAnswer(answerId)

    // Advance to next question or section
    const answered = currentSection.questions.filter(q => q.userAnswer !== null).length
    const sectionCount = SECTION_QUESTION_COUNTS[currentSection.section]

    if (answered >= sectionCount) {
      // All questions in section answered — go to review
      stopTimer()
      setPageState('review')
      setReviewQuestionIndex(0)
    } else {
      // Next question
      const next = selectNextQuestion(session, session.currentSectionIndex, questionPool)
      setCurrentQuestion(next)
      setPendingAnswer(null)
      questionStartTime.current = Date.now()
    }
  }, [session, currentSection, currentQuestion, questionPool, stopTimer])

  // ── Review & Edit ─────────────────────────────────────────

  const handleChangeAnswer = useCallback((questionId: string, newAnswer: string) => {
    if (!session) return
    const result = changeAnswer(session, questionId, newAnswer)
    if (result.success) setSession({ ...session })
  }, [session])

  const handleToggleBookmark = useCallback((questionId: string) => {
    if (!session) return
    bookmarkQuestion(session, questionId)
    setSession({ ...session })
  }, [session])

  // ── Finish section (from review or timer expiry) ──────────

  const handleFinishSection = useCallback(() => {
    if (!session) return
    stopTimer()

    // Mark current section done
    session.sections[session.currentSectionIndex].status = 'completed'

    const isLastSection = session.currentSectionIndex >= session.sections.length - 1

    if (isLastSection) {
      // Generate score report and save to DB
      const rep = generateScoreReport(session)
      setReport(rep)
      saveMockTestResult(rep, session)
      setPageState('report')
    } else {
      // Offer break before next section
      setPageState(session.mode === 'full' ? 'break' : 'section-done')
    }

    setSession({ ...session })
  }, [session, stopTimer])

  // ── Break end → next section ──────────────────────────────

  const handleBreakEnd = useCallback(() => {
    if (!session) return
    // Advance to next section
    const nextIdx = session.currentSectionIndex + 1
    session.currentSectionIndex = nextIdx
    session.sections[nextIdx].status = 'in-progress'
    setSession({ ...session })
    setPageState('section-intro')
  }, [session])

  // ── Save result to DB ─────────────────────────────────────

  const saveMockTestResult = async (rep: ScoreReport, sess: MockTestSession) => {
    try {
      await fetch('/api/mock-test/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalScore: rep.totalScore,
          quantScore: rep.sections.find(s => s.section === 'quant')?.score ?? null,
          verbalScore: rep.sections.find(s => s.section === 'verbal')?.score ?? null,
          dataInsightsScore: rep.sections.find(s => s.section === 'data-insights')?.score ?? null,
          quantAccuracy: rep.sections.find(s => s.section === 'quant')?.accuracy ?? null,
          verbalAccuracy: rep.sections.find(s => s.section === 'verbal')?.accuracy ?? null,
          diAccuracy: rep.sections.find(s => s.section === 'data-insights')?.accuracy ?? null,
          durationMins: Math.floor(rep.timeAnalysis.totalTime / 60),
          notes: rep.recommendations.join(' | '),
        }),
      })
    } catch { /* non-critical */ }
  }

  // ── Render: Setup ─────────────────────────────────────────

  if (pageState === 'setup') {
    return (
      <div className="min-h-full max-w-4xl mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Mock Test</h1>
              <p className="text-slate-400 mt-1">
                Computer-adaptive test — questions adjust to your level in real time
              </p>
            </div>
            <Link
              href="/dashboard/mock-test/history"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-xl transition-colors whitespace-nowrap"
            >
              <History className="w-4 h-4" />
              View History
            </Link>
          </div>
        </div>

        {/* Mode cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <ModeCard
            selected={selectedMode === 'full'}
            onClick={() => { setSelectedMode('full'); setSelectedSection(null) }}
            icon={<Target className="w-5 h-5 text-cyan-400" />}
            iconBg="bg-cyan-500/20"
            title="Full Mock Test"
            subtitle="2 hr 15 min · All 3 sections"
            description="Simulate the real GMAT Focus Edition experience. Adaptive difficulty, section timer, optional break between sections."
            stats={[
              { icon: <Clock className="w-3 h-3" />, label: '135 min' },
              { icon: <BarChart3 className="w-3 h-3" />, label: '64 questions' },
            ]}
            badge="Recommended"
          />
          <ModeCard
            selected={selectedMode === 'section'}
            onClick={() => setSelectedMode('section')}
            icon={<BarChart3 className="w-5 h-5 text-violet-400" />}
            iconBg="bg-violet-500/20"
            title="Section Practice"
            subtitle="45 min · One section"
            description="Focus on a single section with full adaptive difficulty and a timed environment."
            stats={[
              { icon: <Clock className="w-3 h-3" />, label: '45 min' },
              { icon: <BarChart3 className="w-3 h-3" />, label: '20–23 questions' },
            ]}
          />
        </div>

        {/* Section picker */}
        {selectedMode === 'section' && (
          <div className="bg-[#0D1220] rounded-xl border border-white/[0.06] p-6 mb-8">
            <h2 className="text-base font-semibold text-white mb-4">Choose Section</h2>
            <div className="grid md:grid-cols-3 gap-3">
              {GMAT_SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSection(s.id as Section)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedSection === s.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/[0.06] bg-[#151C2C] hover:border-white/[0.12]'
                  }`}
                >
                  <p className="text-sm font-medium text-white">{SECTION_NAMES[s.id as Section]}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    45 min · {SECTION_QUESTION_COUNTS[s.id as Section]} questions
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GMAT rules callout */}
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-400 space-y-1">
              <p><span className="text-amber-300 font-medium">Real GMAT conditions:</span> Explanations shown only after the test. You can review and change answers within each section (max 3 changes per section). Timer is enforced.</p>
            </div>
          </div>
        </div>

        {/* Start button */}
        {selectedMode && (selectedMode === 'full' || selectedSection) && (
          <div className="text-center">
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="inline-flex items-center gap-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-8 py-3.5 text-base font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              {isLoading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading…</>
                : <><Play className="w-5 h-5" /> Start {selectedMode === 'full' ? 'Full Mock Test' : 'Section Practice'}</>
              }
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Render: Section Intro ─────────────────────────────────

  if (pageState === 'section-intro' && session) {
    const sec = session.sections[session.currentSectionIndex]
    const sectionName = SECTION_NAMES[sec.section]
    const questionCount = SECTION_QUESTION_COUNTS[sec.section]
    const meta = SECTION_META[sec.section]

    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 ${meta?.bg} ${meta?.color}`}>
            Section {session.currentSectionIndex + 1} of {session.sections.length}
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">{sectionName}</h1>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400 mb-8">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 45 minutes</span>
            <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> {questionCount} questions</span>
            <span className="flex items-center gap-1.5"><BookmarkIcon className="w-4 h-4" /> Review & Edit allowed</span>
          </div>
          <div className="bg-[#0D1220] border border-white/[0.06] rounded-xl p-5 mb-8 text-left space-y-2">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-3">Rules</p>
            {[
              'Questions adapt to your performance — difficulty adjusts after each answer',
              'You can review and change any answer (max 3 changes) before submitting the section',
              'The timer runs continuously — plan your pace',
              'Explanations are shown after the full test, not during',
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-cyan-500/60 mt-0.5 shrink-0" />
                {rule}
              </div>
            ))}
          </div>
          <button
            onClick={handleSectionIntroStart}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3.5 font-semibold rounded-xl transition-all"
          >
            Begin Section →
          </button>
        </div>
      </div>
    )
  }

  // ── Render: Testing ───────────────────────────────────────

  if (pageState === 'testing' && session && currentSection && currentQuestion) {
    const qIndex = currentSection.questions.length
    const qTotal = SECTION_QUESTION_COUNTS[currentSection.section]
    const progressPct = Math.round((qIndex / qTotal) * 100)
    const isLowTime = timeLeft < 5 * 60

    return (
      <div className="max-w-3xl mx-auto p-4 lg:p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">
              {SECTION_NAMES[currentSection.section]}
            </span>
            <span className="text-xs text-slate-600">
              Q {qIndex}/{qTotal}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleToggleBookmark(currentQuestion.question.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                currentQuestion.bookmarked
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
              title="Bookmark this question"
            >
              <BookmarkIcon className="w-4 h-4" />
            </button>
            <span className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${
              isLowTime ? 'text-red-400' : 'text-slate-300'
            }`}>
              <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'animate-pulse' : ''}`} />
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-1 bg-[#151C2C] rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-cyan-500/60 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Question — no explanation shown */}
        <div className="glass-card p-6 lg:p-8">
          <QuestionCard
            question={currentQuestion.question}
            questionNumber={qIndex}
            totalQuestions={qTotal}
            onSubmit={handleSubmitAnswer}
            timedMode={true}
            disabled={false}
          />
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between mt-4 px-1">
          <button
            onClick={() => { stopTimer(); setPageState('review'); setReviewQuestionIndex(0) }}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Review Section →
          </button>
          <span className="text-xs text-slate-600">
            {currentSection.bookmarks.size > 0 && `${currentSection.bookmarks.size} bookmarked`}
          </span>
        </div>
      </div>
    )
  }

  // ── Render: Review & Edit ─────────────────────────────────

  if (pageState === 'review' && session && currentSection) {
    const questions = currentSection.questions
    const reviewQ = questions[reviewQuestionIndex]
    const changesLeft = currentSection.maxChanges - currentSection.changesUsed

    return (
      <div className="max-w-3xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Review & Edit</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentSection.bookmarks.size > 0
                ? `${currentSection.bookmarks.size} bookmarked · `
                : ''
              }
              {changesLeft} answer change{changesLeft !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <button
            onClick={handleFinishSection}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 text-sm font-semibold rounded-xl transition-all"
          >
            Submit Section →
          </button>
        </div>

        {/* Question navigator */}
        <div className="flex flex-wrap gap-2 mb-5">
          {questions.map((q, i) => (
            <button
              key={q.question.id}
              onClick={() => setReviewQuestionIndex(i)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all relative ${
                i === reviewQuestionIndex
                  ? 'bg-cyan-500 text-white'
                  : q.bookmarked
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : q.originalAnswer
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : q.userAnswer
                        ? 'bg-white/[0.06] text-slate-300'
                        : 'bg-white/[0.03] text-slate-600'
              }`}
            >
              {i + 1}
              {q.bookmarked && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Selected question */}
        {reviewQ && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-slate-500">Question {reviewQuestionIndex + 1}</span>
              {reviewQ.bookmarked && (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <BookmarkIcon className="w-3 h-3" /> Bookmarked
                </span>
              )}
              {reviewQ.originalAnswer && reviewQ.originalAnswer !== reviewQ.userAnswer && (
                <span className="text-xs text-violet-400">Answer changed</span>
              )}
            </div>

            <QuestionCard
              question={reviewQ.question}
              questionNumber={reviewQuestionIndex + 1}
              totalQuestions={questions.length}
              onSubmit={(newAnswer) => {
                if (newAnswer !== reviewQ.userAnswer) {
                  handleChangeAnswer(reviewQ.question.id, newAnswer)
                }
              }}
              timedMode={false}
              disabled={changesLeft === 0 && reviewQ.userAnswer !== null}
              initialAnswer={reviewQ.userAnswer ?? undefined}
            />

            {changesLeft === 0 && (
              <p className="text-xs text-amber-400 mt-3 text-center">
                No answer changes remaining
              </p>
            )}
          </div>
        )}

        {/* Nav arrows */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setReviewQuestionIndex(i => Math.max(0, i - 1))}
            disabled={reviewQuestionIndex === 0}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => handleToggleBookmark(reviewQ?.question.id ?? '')}
            className={`text-sm transition-colors ${
              reviewQ?.bookmarked ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            {reviewQ?.bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
          <button
            onClick={() => setReviewQuestionIndex(i => Math.min(questions.length - 1, i + 1))}
            disabled={reviewQuestionIndex === questions.length - 1}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // ── Render: Break ─────────────────────────────────────────

  if (pageState === 'break' && session) {
    const nextSec = session.sections[session.currentSectionIndex + 1]
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/15 flex items-center justify-center">
            <Coffee className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Optional Break</h1>
          <p className="text-slate-400 mb-6">
            Take up to 10 minutes before <span className="text-white font-medium">{SECTION_NAMES[nextSec?.section]}</span>.
            Your timer starts automatically when you continue.
          </p>
          <div className="text-4xl font-bold font-mono text-amber-400 mb-8">
            {formatTime(breakTimeLeft)}
          </div>
          <button
            onClick={handleBreakEnd}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3.5 font-semibold rounded-xl transition-all"
          >
            Continue to Next Section →
          </button>
        </div>
      </div>
    )
  }

  // ── Render: Score Report ──────────────────────────────────

  if (pageState === 'report' && report) {
    return (
      <div className="min-h-full p-6 lg:p-8">
        <ScoreReportComponent
          report={report}
          onRetake={() => {
            setPageState('setup')
            setSession(null)
            setReport(null)
            setSelectedMode(null)
            setSelectedSection(null)
          }}
          onBackToDashboard={() => router.push('/dashboard/session')}
          onAskSam={() => {
            const summary = encodeURIComponent(
              `I just finished a mock test and scored ${report.totalScore}. ` +
              `Quant: ${report.sections.find(s => s.section === 'quant')?.score ?? 'N/A'}, ` +
              `Verbal: ${report.sections.find(s => s.section === 'verbal')?.score ?? 'N/A'}, ` +
              `DI: ${report.sections.find(s => s.section === 'data-insights')?.score ?? 'N/A'}. ` +
              `Can you review my results and tell me what to focus on next?`
            )
            router.push(`/dashboard/session?context=${summary}`)
          }}
        />
      </div>
    )
  }

  return null
}

// ── ModeCard ───────────────────────────────────────────────

function ModeCard({
  selected, onClick, icon, iconBg, title, subtitle, description, stats, badge,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
  description: string
  stats: { icon: React.ReactNode; label: string }[]
  badge?: string
}) {
  return (
    <div
      onClick={onClick}
      className={`relative p-6 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
          : 'border-white/[0.06] bg-[#0D1220] hover:border-white/[0.12]'
      }`}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/25">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">{description}</p>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        {stats.map((s, i) => (
          <span key={i} className="flex items-center gap-1">{s.icon}{s.label}</span>
        ))}
      </div>
    </div>
  )
}
