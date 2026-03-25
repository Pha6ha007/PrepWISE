// lib/gmat/mock-analytics-data.ts
// PrepWise — Mock analytics data for dashboard components
// TODO: Replace with real Prisma queries when the app is live and sessions are being tracked.

import { GMAT_TOPICS } from './topics'

// ── Error Analysis Data ────────────────────────────────────

export type ErrorType = 'concept' | 'careless' | 'time_pressure' | 'misread'

export interface ErrorEntry {
  id: string
  errorType: ErrorType
  section: 'quant' | 'verbal' | 'data-insights'
  topicId: string
  timeTakenSec: number
  sessionDate: string
}

export interface SessionErrorSummary {
  sessionDate: string
  concept: number
  careless: number
  time_pressure: number
  misread: number
  total: number
}

/** Classify an incorrect answer into an error type based on time taken */
export function classifyError(timeTakenSec: number): ErrorType {
  if (timeTakenSec < 30) return 'misread'
  if (timeTakenSec > 180) return 'time_pressure'
  // 30-180s: default to concept (in reality, would use answer-pattern analysis)
  return Math.random() > 0.35 ? 'concept' : 'careless'
}

export const MOCK_ERROR_ENTRIES: ErrorEntry[] = [
  { id: 'e1', errorType: 'concept', section: 'quant', topicId: 'algebra', timeTakenSec: 95, sessionDate: '2026-03-18' },
  { id: 'e2', errorType: 'careless', section: 'quant', topicId: 'arithmetic', timeTakenSec: 72, sessionDate: '2026-03-18' },
  { id: 'e3', errorType: 'time_pressure', section: 'verbal', topicId: 'critical-reasoning', timeTakenSec: 210, sessionDate: '2026-03-18' },
  { id: 'e4', errorType: 'misread', section: 'data-insights', topicId: 'data-sufficiency', timeTakenSec: 18, sessionDate: '2026-03-18' },
  { id: 'e5', errorType: 'concept', section: 'quant', topicId: 'number-properties', timeTakenSec: 120, sessionDate: '2026-03-19' },
  { id: 'e6', errorType: 'concept', section: 'verbal', topicId: 'reading-comprehension', timeTakenSec: 105, sessionDate: '2026-03-19' },
  { id: 'e7', errorType: 'careless', section: 'quant', topicId: 'algebra', timeTakenSec: 55, sessionDate: '2026-03-19' },
  { id: 'e8', errorType: 'time_pressure', section: 'data-insights', topicId: 'multi-source-reasoning', timeTakenSec: 195, sessionDate: '2026-03-19' },
  { id: 'e9', errorType: 'misread', section: 'quant', topicId: 'word-problems', timeTakenSec: 22, sessionDate: '2026-03-20' },
  { id: 'e10', errorType: 'concept', section: 'data-insights', topicId: 'table-analysis', timeTakenSec: 88, sessionDate: '2026-03-20' },
  { id: 'e11', errorType: 'careless', section: 'verbal', topicId: 'critical-reasoning', timeTakenSec: 67, sessionDate: '2026-03-20' },
  { id: 'e12', errorType: 'concept', section: 'quant', topicId: 'statistics-probability', timeTakenSec: 140, sessionDate: '2026-03-20' },
  { id: 'e13', errorType: 'time_pressure', section: 'quant', topicId: 'word-problems', timeTakenSec: 200, sessionDate: '2026-03-21' },
  { id: 'e14', errorType: 'concept', section: 'verbal', topicId: 'reading-comprehension', timeTakenSec: 110, sessionDate: '2026-03-21' },
  { id: 'e15', errorType: 'misread', section: 'data-insights', topicId: 'graphics-interpretation', timeTakenSec: 15, sessionDate: '2026-03-21' },
  { id: 'e16', errorType: 'careless', section: 'quant', topicId: 'arithmetic', timeTakenSec: 60, sessionDate: '2026-03-21' },
  { id: 'e17', errorType: 'concept', section: 'quant', topicId: 'algebra', timeTakenSec: 130, sessionDate: '2026-03-22' },
  { id: 'e18', errorType: 'concept', section: 'data-insights', topicId: 'two-part-analysis', timeTakenSec: 115, sessionDate: '2026-03-22' },
  { id: 'e19', errorType: 'careless', section: 'verbal', topicId: 'critical-reasoning', timeTakenSec: 80, sessionDate: '2026-03-22' },
  { id: 'e20', errorType: 'time_pressure', section: 'quant', topicId: 'number-properties', timeTakenSec: 185, sessionDate: '2026-03-22' },
  { id: 'e21', errorType: 'concept', section: 'quant', topicId: 'statistics-probability', timeTakenSec: 100, sessionDate: '2026-03-23' },
  { id: 'e22', errorType: 'misread', section: 'verbal', topicId: 'reading-comprehension', timeTakenSec: 25, sessionDate: '2026-03-23' },
  { id: 'e23', errorType: 'careless', section: 'data-insights', topicId: 'data-sufficiency', timeTakenSec: 70, sessionDate: '2026-03-23' },
  { id: 'e24', errorType: 'concept', section: 'quant', topicId: 'word-problems', timeTakenSec: 135, sessionDate: '2026-03-23' },
  { id: 'e25', errorType: 'time_pressure', section: 'verbal', topicId: 'critical-reasoning', timeTakenSec: 220, sessionDate: '2026-03-24' },
  { id: 'e26', errorType: 'concept', section: 'data-insights', topicId: 'multi-source-reasoning', timeTakenSec: 125, sessionDate: '2026-03-24' },
  { id: 'e27', errorType: 'careless', section: 'quant', topicId: 'algebra', timeTakenSec: 50, sessionDate: '2026-03-24' },
  { id: 'e28', errorType: 'concept', section: 'quant', topicId: 'number-properties', timeTakenSec: 108, sessionDate: '2026-03-24' },
]

/** Aggregate errors per session for trend chart */
export function getSessionErrorTrends(errors: ErrorEntry[]): SessionErrorSummary[] {
  const byDate = new Map<string, SessionErrorSummary>()
  for (const e of errors) {
    if (!byDate.has(e.sessionDate)) {
      byDate.set(e.sessionDate, {
        sessionDate: e.sessionDate,
        concept: 0,
        careless: 0,
        time_pressure: 0,
        misread: 0,
        total: 0,
      })
    }
    const s = byDate.get(e.sessionDate)!
    s[e.errorType]++
    s.total++
  }
  return Array.from(byDate.values()).sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))
}

/** Aggregate errors by section */
export function getErrorsBySection(errors: ErrorEntry[]) {
  const sections = { quant: { concept: 0, careless: 0, time_pressure: 0, misread: 0, total: 0 }, verbal: { concept: 0, careless: 0, time_pressure: 0, misread: 0, total: 0 }, 'data-insights': { concept: 0, careless: 0, time_pressure: 0, misread: 0, total: 0 } }
  for (const e of errors) {
    const s = sections[e.section]
    s[e.errorType]++
    s.total++
  }
  return sections
}

// ── Timing Analytics Data ──────────────────────────────────

export interface TimingEntry {
  section: 'quant' | 'verbal' | 'data-insights'
  topicId: string
  timeTakenSec: number
  correct: boolean
}

export const MOCK_TIMING_DATA: TimingEntry[] = [
  // Quant — target 128s (2:08)
  { section: 'quant', topicId: 'algebra', timeTakenSec: 135, correct: true },
  { section: 'quant', topicId: 'algebra', timeTakenSec: 95, correct: true },
  { section: 'quant', topicId: 'arithmetic', timeTakenSec: 72, correct: false },
  { section: 'quant', topicId: 'arithmetic', timeTakenSec: 110, correct: true },
  { section: 'quant', topicId: 'word-problems', timeTakenSec: 200, correct: false },
  { section: 'quant', topicId: 'word-problems', timeTakenSec: 155, correct: true },
  { section: 'quant', topicId: 'number-properties', timeTakenSec: 120, correct: false },
  { section: 'quant', topicId: 'number-properties', timeTakenSec: 185, correct: false },
  { section: 'quant', topicId: 'statistics-probability', timeTakenSec: 140, correct: true },
  { section: 'quant', topicId: 'statistics-probability', timeTakenSec: 100, correct: true },
  { section: 'quant', topicId: 'algebra', timeTakenSec: 22, correct: false },
  { section: 'quant', topicId: 'arithmetic', timeTakenSec: 18, correct: false },
  { section: 'quant', topicId: 'word-problems', timeTakenSec: 250, correct: false },
  // Verbal — target 117s (1:57)
  { section: 'verbal', topicId: 'critical-reasoning', timeTakenSec: 145, correct: true },
  { section: 'verbal', topicId: 'critical-reasoning', timeTakenSec: 210, correct: false },
  { section: 'verbal', topicId: 'critical-reasoning', timeTakenSec: 130, correct: true },
  { section: 'verbal', topicId: 'reading-comprehension', timeTakenSec: 105, correct: false },
  { section: 'verbal', topicId: 'reading-comprehension', timeTakenSec: 150, correct: true },
  { section: 'verbal', topicId: 'reading-comprehension', timeTakenSec: 25, correct: false },
  { section: 'verbal', topicId: 'critical-reasoning', timeTakenSec: 67, correct: false },
  { section: 'verbal', topicId: 'reading-comprehension', timeTakenSec: 190, correct: true },
  // Data Insights — target 135s (2:15)
  { section: 'data-insights', topicId: 'data-sufficiency', timeTakenSec: 160, correct: true },
  { section: 'data-insights', topicId: 'data-sufficiency', timeTakenSec: 18, correct: false },
  { section: 'data-insights', topicId: 'multi-source-reasoning', timeTakenSec: 195, correct: false },
  { section: 'data-insights', topicId: 'multi-source-reasoning', timeTakenSec: 125, correct: true },
  { section: 'data-insights', topicId: 'table-analysis', timeTakenSec: 88, correct: false },
  { section: 'data-insights', topicId: 'table-analysis', timeTakenSec: 142, correct: true },
  { section: 'data-insights', topicId: 'graphics-interpretation', timeTakenSec: 15, correct: false },
  { section: 'data-insights', topicId: 'graphics-interpretation', timeTakenSec: 110, correct: true },
  { section: 'data-insights', topicId: 'two-part-analysis', timeTakenSec: 170, correct: true },
  { section: 'data-insights', topicId: 'two-part-analysis', timeTakenSec: 115, correct: false },
]

export interface SectionTimingStats {
  section: string
  sectionLabel: string
  avgTimeSec: number
  targetTimeSec: number
  totalQuestions: number
  tooFast: number      // < 30s
  tooSlow: number      // > 180s
  onPace: number
}

/** Target pace per question in seconds */
export const TARGET_PACE: Record<string, number> = {
  quant: 128,           // 2:08
  verbal: 117,          // 1:57
  'data-insights': 135, // 2:15
}

export const SECTION_LABELS: Record<string, string> = {
  quant: 'Quantitative',
  verbal: 'Verbal',
  'data-insights': 'Data Insights',
}

export function computeTimingStats(entries: TimingEntry[]): SectionTimingStats[] {
  const groups: Record<string, TimingEntry[]> = {}
  for (const e of entries) {
    if (!groups[e.section]) groups[e.section] = []
    groups[e.section].push(e)
  }

  return Object.entries(groups).map(([section, items]) => {
    const avgTimeSec = items.reduce((s, i) => s + i.timeTakenSec, 0) / items.length
    const tooFast = items.filter(i => i.timeTakenSec < 30).length
    const tooSlow = items.filter(i => i.timeTakenSec > 180).length
    return {
      section,
      sectionLabel: SECTION_LABELS[section] || section,
      avgTimeSec: Math.round(avgTimeSec),
      targetTimeSec: TARGET_PACE[section] || 120,
      totalQuestions: items.length,
      tooFast,
      tooSlow,
      onPace: items.length - tooFast - tooSlow,
    }
  })
}

// ── Topic Heatmap Data ─────────────────────────────────────

export interface TopicMasteryData {
  topicId: string
  topicName: string
  section: 'quant' | 'verbal' | 'data-insights'
  attempted: number
  correct: number
  accuracy: number      // 0-1
  avgTimeSec: number
}

export const MOCK_TOPIC_MASTERY: TopicMasteryData[] = GMAT_TOPICS.map(topic => {
  // Generate realistic mock data — some topics practiced heavily, some barely
  const practiced = Math.random() > 0.15 // 85% chance of being attempted
  const attempted = practiced ? Math.floor(Math.random() * 40) + 5 : 0
  const accuracy = practiced ? Math.round((Math.random() * 0.6 + 0.3) * 100) / 100 : 0
  const correct = Math.round(attempted * accuracy)
  const avgTimeSec = practiced ? Math.floor(Math.random() * 100) + 60 : 0

  return {
    topicId: topic.id,
    topicName: topic.name,
    section: topic.section,
    attempted,
    correct,
    accuracy,
    avgTimeSec,
  }
})

// ── Score Predictor Data ───────────────────────────────────

export interface ScoreSnapshot {
  date: string
  quantScore: number
  verbalScore: number
  diScore: number
  totalScore: number
}

export const MOCK_SCORE_HISTORY: ScoreSnapshot[] = [
  { date: '2026-03-04', quantScore: 68, verbalScore: 65, diScore: 66, totalScore: 545 },
  { date: '2026-03-08', quantScore: 70, verbalScore: 67, diScore: 68, totalScore: 585 },
  { date: '2026-03-11', quantScore: 72, verbalScore: 68, diScore: 69, totalScore: 605 },
  { date: '2026-03-14', quantScore: 73, verbalScore: 70, diScore: 70, totalScore: 625 },
  { date: '2026-03-17', quantScore: 74, verbalScore: 71, diScore: 71, totalScore: 645 },
  { date: '2026-03-20', quantScore: 76, verbalScore: 72, diScore: 72, totalScore: 665 },
  { date: '2026-03-23', quantScore: 77, verbalScore: 74, diScore: 73, totalScore: 685 },
]

/** Current accuracy by section for score estimation */
export const MOCK_SECTION_ACCURACY = {
  quant: 0.72,
  verbal: 0.68,
  'data-insights': 0.65,
}

export const MOCK_TARGET_SCORE = 720
