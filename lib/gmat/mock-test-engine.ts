// lib/gmat/mock-test-engine.ts
// Prepwise — Computer-Adaptive Mock Test Engine (GMAT Focus Edition)
// Pure logic module: no UI, no API calls, no database. All state in-memory.

import type { GmatQuestion, Section, Difficulty } from './question-types'
import { SAMPLE_QUESTIONS } from './question-types'
import { estimateTotalScore, estimateSectionScore, getPercentile } from './scoring'
import { updateDifficultyState, createDifficultyState } from './difficulty'

// ── Section Configuration ──────────────────────────────────

interface SectionConfig {
  section: Section
  questionCount: number
  timeLimitSeconds: number
}

const SECTION_CONFIGS: SectionConfig[] = [
  { section: 'quant', questionCount: 21, timeLimitSeconds: 45 * 60 },
  { section: 'verbal', questionCount: 23, timeLimitSeconds: 45 * 60 },
  { section: 'data-insights', questionCount: 20, timeLimitSeconds: 45 * 60 },
]

// ── Types ──────────────────────────────────────────────────

export interface MockTestSession {
  id: string
  mode: 'full' | 'section'
  sections: MockTestSection[]
  currentSectionIndex: number
  startTime: number
  status: 'in-progress' | 'completed'
}

export interface MockTestSection {
  id: string
  section: Section
  questions: MockTestQuestion[]
  currentQuestionIndex: number
  timeLimit: number
  timeUsed: number
  currentDifficulty: Difficulty
  consecutiveCorrect: number
  consecutiveWrong: number
  bookmarks: Set<string>
  changesUsed: number
  maxChanges: 3
  status: 'pending' | 'in-progress' | 'completed'
}

export interface MockTestQuestion {
  question: GmatQuestion
  userAnswer: string | null
  timeTaken: number
  correct: boolean | null
  bookmarked: boolean
  originalAnswer: string | null
}

export interface ScoreReport {
  totalScore: number
  percentile: number
  sections: SectionScore[]
  timeAnalysis: TimeAnalysis
  topicBreakdown: TopicScore[]
  recommendations: string[]
}

export interface SectionScore {
  section: Section
  score: number
  accuracy: number
  questionsAnswered: number
  totalQuestions: number
  averageTime: number
  difficultyReached: Difficulty
}

export interface TimeAnalysis {
  totalTime: number
  averagePerQuestion: number
  fastestQuestion: { questionId: string; time: number } | null
  slowestQuestion: { questionId: string; time: number } | null
  overtimeQuestions: { questionId: string; time: number; expected: number }[]
}

export interface TopicScore {
  topic: string
  section: Section
  correct: number
  total: number
  accuracy: number
}

type ErrorType = 'concept' | 'careless' | 'time_pressure'

export interface ErrorClassification {
  questionId: string
  type: ErrorType
  topic: string
  difficulty: Difficulty
}

// ── ID Generation ──────────────────────────────────────────

let idCounter = 0

function generateId(prefix: string): string {
  idCounter++
  return `${prefix}_${Date.now()}_${idCounter}`
}

// ── Expected time per question by difficulty (seconds) ─────

const EXPECTED_TIME: Record<Difficulty, number> = {
  easy: 90,
  medium: 120,
  hard: 150,
  '700+': 180,
}

// ── Core Engine Functions ──────────────────────────────────

/**
 * Initialize a mock test session.
 *
 * @param mode - 'full' for all 3 sections, 'section' for a single section
 * @param section - required when mode is 'section'
 */
export function createMockTest(
  mode: 'full' | 'section',
  section?: Section
): MockTestSession {
  const configs =
    mode === 'full'
      ? SECTION_CONFIGS
      : SECTION_CONFIGS.filter((c) => c.section === (section ?? 'quant'))

  if (mode === 'section' && configs.length === 0) {
    throw new Error(`Invalid section: ${section}`)
  }

  const sessionId = generateId('mock')

  const sections: MockTestSection[] = configs.map((config, i) => ({
    id: generateId(`sec_${config.section}`),
    section: config.section,
    questions: [],
    currentQuestionIndex: 0,
    timeLimit: config.timeLimitSeconds,
    timeUsed: 0,
    currentDifficulty: 'medium' as Difficulty,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    bookmarks: new Set<string>(),
    changesUsed: 0,
    maxChanges: 3 as const,
    status: (i === 0 ? 'in-progress' : 'pending') as MockTestSection['status'],
  }))

  return {
    id: sessionId,
    mode,
    sections,
    currentSectionIndex: 0,
    startTime: Date.now(),
    status: 'in-progress',
  }
}

/**
 * Select the next question for the current section using adaptive difficulty.
 *
 * Filters by section + current difficulty, excluding already-seen questions.
 * Falls back to adjacent difficulty levels if no exact match is available.
 *
 * @returns The next question wrapped as MockTestQuestion, or null if the section is complete.
 */
export function selectNextQuestion(
  session: MockTestSession,
  sectionIndex: number,
  questionPool: GmatQuestion[] = SAMPLE_QUESTIONS
): MockTestQuestion | null {
  const section = session.sections[sectionIndex]
  if (!section) return null

  const config = SECTION_CONFIGS.find((c) => c.section === section.section)
  if (!config) return null

  // Section already has enough questions
  if (section.questions.length >= config.questionCount) {
    return null
  }

  const seenIds = new Set(section.questions.map((q) => q.question.id))
  const targetDifficulty = section.currentDifficulty

  // Try exact difficulty match first, then expand outward
  const difficultyOrder = buildDifficultyFallback(targetDifficulty)

  let picked: GmatQuestion | null = null

  for (const diff of difficultyOrder) {
    const candidates = questionPool.filter(
      (q) =>
        q.section === section.section &&
        q.difficulty === diff &&
        !seenIds.has(q.id)
    )
    if (candidates.length > 0) {
      // Pick a random candidate for variety
      picked = candidates[Math.floor(Math.random() * candidates.length)]
      break
    }
  }

  // If no questions available at all for this section, return null
  if (!picked) return null

  const mockQuestion: MockTestQuestion = {
    question: picked,
    userAnswer: null,
    timeTaken: 0,
    correct: null,
    bookmarked: false,
    originalAnswer: null,
  }

  section.questions.push(mockQuestion)
  section.currentQuestionIndex = section.questions.length - 1

  return mockQuestion
}

/**
 * Build a priority-ordered list of difficulties to try, starting from the target.
 * Prefers the target, then adjacent levels, expanding outward.
 */
function buildDifficultyFallback(target: Difficulty): Difficulty[] {
  const levels: Difficulty[] = ['easy', 'medium', 'hard', '700+']
  const idx = levels.indexOf(target)
  const result: Difficulty[] = [target]

  let lo = idx - 1
  let hi = idx + 1

  while (lo >= 0 || hi < levels.length) {
    if (hi < levels.length) result.push(levels[hi++])
    if (lo >= 0) result.push(levels[lo--])
  }

  return result
}

/**
 * Submit an answer for a question. Updates adaptive difficulty state.
 *
 * @returns Result including correctness, new difficulty, and questions remaining.
 */
export function submitAnswer(
  session: MockTestSession,
  questionId: string,
  answerId: string,
  timeTaken: number
): { correct: boolean; newDifficulty: Difficulty; questionsRemaining: number } {
  const { section, question } = findQuestion(session, questionId)

  if (question.userAnswer !== null) {
    throw new Error(`Question ${questionId} already answered. Use changeAnswer() instead.`)
  }

  const isCorrect = getCorrectAnswer(question.question) === answerId

  // Record answer
  question.userAnswer = answerId
  question.timeTaken = timeTaken
  question.correct = isCorrect

  // Update section time
  section.timeUsed += timeTaken

  // Update adaptive difficulty via the existing difficulty module
  const diffState = createDifficultyState()
  diffState.currentLevel = section.currentDifficulty
  diffState.consecutiveCorrect = section.consecutiveCorrect
  diffState.consecutiveWrong = section.consecutiveWrong
  diffState.totalAttempts = section.questions.filter((q) => q.userAnswer !== null).length - 1
  diffState.totalCorrect = section.questions.filter((q) => q.correct === true).length - (isCorrect ? 1 : 0)

  const updated = updateDifficultyState(diffState, isCorrect)

  section.currentDifficulty = updated.currentLevel
  section.consecutiveCorrect = updated.consecutiveCorrect
  section.consecutiveWrong = updated.consecutiveWrong

  const config = SECTION_CONFIGS.find((c) => c.section === section.section)!
  const answered = section.questions.filter((q) => q.userAnswer !== null).length
  const remaining = config.questionCount - answered

  // Auto-complete section if all questions answered
  if (remaining <= 0) {
    section.status = 'completed'
    advanceSection(session)
  }

  return {
    correct: isCorrect,
    newDifficulty: section.currentDifficulty,
    questionsRemaining: Math.max(0, remaining),
  }
}

/**
 * Toggle bookmark on a question.
 */
export function bookmarkQuestion(
  session: MockTestSession,
  questionId: string
): boolean {
  const { section, question } = findQuestion(session, questionId)

  if (section.bookmarks.has(questionId)) {
    section.bookmarks.delete(questionId)
    question.bookmarked = false
  } else {
    section.bookmarks.add(questionId)
    question.bookmarked = true
  }

  return question.bookmarked
}

/**
 * Change a previously submitted answer (max 3 per section).
 *
 * @returns success status and remaining changes.
 */
export function changeAnswer(
  session: MockTestSession,
  questionId: string,
  newAnswerId: string
): { success: boolean; changesRemaining: number } {
  const { section, question } = findQuestion(session, questionId)

  if (question.userAnswer === null) {
    return { success: false, changesRemaining: section.maxChanges - section.changesUsed }
  }

  if (section.changesUsed >= section.maxChanges) {
    return { success: false, changesRemaining: 0 }
  }

  // Preserve the first answer for analytics
  if (question.originalAnswer === null) {
    question.originalAnswer = question.userAnswer
  }

  question.userAnswer = newAnswerId
  question.correct = getCorrectAnswer(question.question) === newAnswerId
  section.changesUsed++

  // Recalculate consecutive streaks from the full answer history.
  // This matters because changing an answer can flip a correct→wrong or vice versa.
  recalculateStreaks(section)

  return {
    success: true,
    changesRemaining: section.maxChanges - section.changesUsed,
  }
}

/**
 * Generate a comprehensive score report for a completed (or in-progress) session.
 */
export function generateScoreReport(session: MockTestSession): ScoreReport {
  const sectionScores: SectionScore[] = session.sections.map((sec) => {
    const answered = sec.questions.filter((q) => q.userAnswer !== null)
    const correct = answered.filter((q) => q.correct === true).length
    const accuracy = answered.length > 0 ? correct / answered.length : 0
    const totalTime = answered.reduce((sum, q) => sum + q.timeTaken, 0)
    const avgTime = answered.length > 0 ? totalTime / answered.length : 0

    // Highest difficulty reached (the peak the student got to)
    const diffOrder: Difficulty[] = ['easy', 'medium', 'hard', '700+']
    const questionsWithDiff = sec.questions.filter((q) => q.correct === true)
    const peakDifficulty = questionsWithDiff.reduce<Difficulty>((peak, q) => {
      return diffOrder.indexOf(q.question.difficulty) > diffOrder.indexOf(peak)
        ? q.question.difficulty
        : peak
    }, 'easy')

    return {
      section: sec.section,
      score: estimateSectionScore(accuracy),
      accuracy,
      questionsAnswered: answered.length,
      totalQuestions: sec.questions.length,
      averageTime: Math.round(avgTime),
      difficultyReached: peakDifficulty,
    }
  })

  // Total score: use section scores or default to 60 for missing sections
  const quantScore = sectionScores.find((s) => s.section === 'quant')?.score ?? 60
  const verbalScore = sectionScores.find((s) => s.section === 'verbal')?.score ?? 60
  const diScore = sectionScores.find((s) => s.section === 'data-insights')?.score ?? 60

  const totalScore = estimateTotalScore(quantScore, verbalScore, diScore)
  const percentile = getPercentile(totalScore)

  // Time analysis
  const allAnswered = session.sections.flatMap((s) =>
    s.questions.filter((q) => q.userAnswer !== null)
  )
  const totalTime = allAnswered.reduce((sum, q) => sum + q.timeTaken, 0)
  const avgTime = allAnswered.length > 0 ? totalTime / allAnswered.length : 0

  let fastest: TimeAnalysis['fastestQuestion'] = null
  let slowest: TimeAnalysis['slowestQuestion'] = null
  const overtime: TimeAnalysis['overtimeQuestions'] = []

  for (const q of allAnswered) {
    if (!fastest || q.timeTaken < fastest.time) {
      fastest = { questionId: q.question.id, time: q.timeTaken }
    }
    if (!slowest || q.timeTaken > slowest.time) {
      slowest = { questionId: q.question.id, time: q.timeTaken }
    }
    const expected = EXPECTED_TIME[q.question.difficulty]
    if (q.timeTaken > expected) {
      overtime.push({ questionId: q.question.id, time: q.timeTaken, expected })
    }
  }

  const timeAnalysis: TimeAnalysis = {
    totalTime,
    averagePerQuestion: Math.round(avgTime),
    fastestQuestion: fastest,
    slowestQuestion: slowest,
    overtimeQuestions: overtime,
  }

  // Topic breakdown
  const topicMap = new Map<string, TopicScore>()

  for (const sec of session.sections) {
    for (const q of sec.questions) {
      if (q.userAnswer === null) continue
      const key = `${q.question.section}::${q.question.topic}`
      const existing = topicMap.get(key)

      if (existing) {
        existing.total++
        if (q.correct) existing.correct++
        existing.accuracy = existing.correct / existing.total
      } else {
        topicMap.set(key, {
          topic: q.question.topic,
          section: q.question.section,
          correct: q.correct ? 1 : 0,
          total: 1,
          accuracy: q.correct ? 1 : 0,
        })
      }
    }
  }

  const topicBreakdown = Array.from(topicMap.values())

  // Error classification
  const errors = classifyErrors(session)

  // Recommendations
  const recommendations = generateRecommendations(sectionScores, topicBreakdown, errors, timeAnalysis)

  return {
    totalScore,
    percentile,
    sections: sectionScores,
    timeAnalysis,
    topicBreakdown,
    recommendations,
  }
}

// ── Internal Helpers ───────────────────────────────────────

/**
 * Locate a question across all sections. Throws if not found.
 */
function findQuestion(
  session: MockTestSession,
  questionId: string
): { section: MockTestSection; question: MockTestQuestion; sectionIndex: number } {
  for (let i = 0; i < session.sections.length; i++) {
    const sec = session.sections[i]
    const q = sec.questions.find((mq) => mq.question.id === questionId)
    if (q) return { section: sec, question: q, sectionIndex: i }
  }
  throw new Error(`Question ${questionId} not found in session ${session.id}`)
}

/**
 * Get the correct answer ID for a question, handling the different question shapes.
 *
 * RCQuestion has sub-questions — for the mock test engine we use the first
 * sub-question's correct answer since RC passages are presented as individual items.
 */
function getCorrectAnswer(question: GmatQuestion): string {
  if (question.type === 'RC') {
    // RC questions have nested sub-questions; use the first one
    return question.questions[0]?.correctAnswer ?? ''
  }
  return question.correctAnswer
}

/**
 * Advance to the next section when the current one completes.
 */
function advanceSection(session: MockTestSession): void {
  const nextIdx = session.currentSectionIndex + 1
  if (nextIdx < session.sections.length) {
    session.currentSectionIndex = nextIdx
    session.sections[nextIdx].status = 'in-progress'
  } else {
    session.status = 'completed'
  }
}

/**
 * Recalculate consecutive correct/wrong streaks from the answer history.
 * Called after changeAnswer since flipping an earlier answer changes the streak.
 */
function recalculateStreaks(section: MockTestSection): void {
  let consCorrect = 0
  let consWrong = 0

  // Walk the questions in order, tracking the streak at the end
  for (const q of section.questions) {
    if (q.userAnswer === null) continue

    if (q.correct) {
      consCorrect++
      consWrong = 0
    } else {
      consWrong++
      consCorrect = 0
    }
  }

  section.consecutiveCorrect = consCorrect
  section.consecutiveWrong = consWrong

  // Recompute difficulty from the current streaks
  const diffState = createDifficultyState()
  diffState.currentLevel = section.currentDifficulty
  diffState.consecutiveCorrect = consCorrect
  diffState.consecutiveWrong = consWrong

  const answered = section.questions.filter((q) => q.userAnswer !== null)
  diffState.totalAttempts = answered.length
  diffState.totalCorrect = answered.filter((q) => q.correct === true).length

  // Only adjust if streaks hit thresholds
  const levels: Difficulty[] = ['easy', 'medium', 'hard', '700+']
  const idx = levels.indexOf(section.currentDifficulty)

  if (consCorrect >= 3 && idx < levels.length - 1) {
    section.currentDifficulty = levels[idx + 1]
  } else if (consWrong >= 2 && idx > 0) {
    section.currentDifficulty = levels[idx - 1]
  }
}

/**
 * Classify each incorrect answer into an error type.
 */
function classifyErrors(session: MockTestSession): ErrorClassification[] {
  const errors: ErrorClassification[] = []

  for (const sec of session.sections) {
    for (const q of sec.questions) {
      if (q.correct !== false) continue

      const expected = EXPECTED_TIME[q.question.difficulty]
      let errorType: ErrorType

      if (q.timeTaken > expected * 1.5) {
        // Ran out of time or rushed at the end — time pressure
        errorType = 'time_pressure'
      } else if (q.timeTaken < expected * 0.5) {
        // Answered way too fast — likely careless
        errorType = 'careless'
      } else {
        // Spent reasonable time but still wrong — concept gap
        errorType = 'concept'
      }

      errors.push({
        questionId: q.question.id,
        type: errorType,
        topic: q.question.topic,
        difficulty: q.question.difficulty,
      })
    }
  }

  return errors
}

/**
 * Generate actionable study recommendations based on performance data.
 */
function generateRecommendations(
  sectionScores: SectionScore[],
  topicBreakdown: TopicScore[],
  errors: ErrorClassification[],
  timeAnalysis: TimeAnalysis
): string[] {
  const recs: string[] = []

  // Weak sections (below 70 score)
  for (const sec of sectionScores) {
    if (sec.score < 70) {
      recs.push(`Focus on ${sec.section} — your score of ${sec.score} indicates fundamental gaps.`)
    }
  }

  // Weak topics (below 50% accuracy with at least 2 questions)
  const weakTopics = topicBreakdown
    .filter((t) => t.accuracy < 0.5 && t.total >= 2)
    .sort((a, b) => a.accuracy - b.accuracy)

  for (const topic of weakTopics.slice(0, 3)) {
    recs.push(
      `Review ${topic.topic} (${topic.section}) — ${Math.round(topic.accuracy * 100)}% accuracy.`
    )
  }

  // Error pattern analysis
  const conceptErrors = errors.filter((e) => e.type === 'concept').length
  const carelessErrors = errors.filter((e) => e.type === 'careless').length
  const timePressureErrors = errors.filter((e) => e.type === 'time_pressure').length

  if (carelessErrors >= 3) {
    recs.push(
      `${carelessErrors} careless errors detected. Slow down on easier questions and double-check your work.`
    )
  }

  if (timePressureErrors >= 3) {
    recs.push(
      `${timePressureErrors} errors under time pressure. Practice pacing — aim for ${Math.round(timeAnalysis.averagePerQuestion)}s or less per question.`
    )
  }

  if (conceptErrors >= 3) {
    // Find the most common concept-error topics
    const conceptTopics = new Map<string, number>()
    for (const e of errors.filter((e) => e.type === 'concept')) {
      conceptTopics.set(e.topic, (conceptTopics.get(e.topic) ?? 0) + 1)
    }
    const topConceptGap = [...conceptTopics.entries()].sort((a, b) => b[1] - a[1])[0]
    if (topConceptGap) {
      recs.push(`Concept gap in ${topConceptGap[0]} — review fundamentals before practicing more questions.`)
    }
  }

  // Pacing
  if (timeAnalysis.overtimeQuestions.length > 5) {
    recs.push(
      `${timeAnalysis.overtimeQuestions.length} questions over time limit. Consider guessing strategically on hard questions to save time.`
    )
  }

  // If no specific recs, give a general one
  if (recs.length === 0) {
    recs.push('Solid performance. Continue practicing at the current difficulty level to build consistency.')
  }

  return recs
}

// ── Serialization Helpers ──────────────────────────────────

/**
 * Serialize a session for JSON storage (converts Sets to arrays).
 */
export function serializeSession(session: MockTestSession): Record<string, unknown> {
  return {
    ...session,
    sections: session.sections.map((sec) => ({
      ...sec,
      bookmarks: Array.from(sec.bookmarks),
    })),
  }
}

/**
 * Deserialize a session from JSON storage (converts arrays back to Sets).
 */
export function deserializeSession(data: Record<string, unknown>): MockTestSession {
  const raw = data as unknown as MockTestSession
  return {
    ...raw,
    sections: raw.sections.map((sec) => ({
      ...sec,
      bookmarks: new Set(sec.bookmarks as unknown as string[]),
    })),
  }
}
