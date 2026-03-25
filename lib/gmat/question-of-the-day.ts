// lib/gmat/question-of-the-day.ts
// Deterministic daily question selector — client-safe (no fs/path).
// Uses SAMPLE_QUESTIONS as the pool. If the full question bank is loaded
// server-side, you can pass a custom pool via getQuestionOfTheDay().

import {
  SAMPLE_QUESTIONS,
  type GmatQuestion,
  type Section,
  SECTION_META,
} from './question-types'

/**
 * Day-of-week → section rotation.
 * Mon=Quant, Tue=Verbal, Wed=DI, Thu=Quant, Fri=Verbal, Sat=DI, Sun=mixed
 */
const DAY_SECTION_MAP: Record<number, Section | 'mixed'> = {
  0: 'mixed',           // Sunday
  1: 'quant',           // Monday
  2: 'verbal',          // Tuesday
  3: 'data-insights',   // Wednesday
  4: 'quant',           // Thursday
  5: 'verbal',          // Friday
  6: 'data-insights',   // Saturday
}

/**
 * Simple deterministic hash: sum of char codes.
 * Stable for any given date string.
 */
function hashDateString(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash += dateStr.charCodeAt(i)
  }
  return hash
}

/**
 * Format a Date to YYYY-MM-DD in local timezone.
 */
function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export interface QuestionOfTheDayResult {
  question: GmatQuestion
  section: Section
  sectionLabel: string
  dateString: string
}

/**
 * Get a deterministic question for a given date.
 *
 * @param date — YYYY-MM-DD string, or omit for today
 * @param pool — optional custom question pool (defaults to SAMPLE_QUESTIONS)
 */
export function getQuestionOfTheDay(
  date?: string,
  pool: GmatQuestion[] = SAMPLE_QUESTIONS
): QuestionOfTheDayResult {
  const now = new Date()
  const dateString = date ?? toDateString(now)

  // Parse date to get day of week
  const parsed = new Date(dateString + 'T00:00:00')
  const dayOfWeek = parsed.getDay()
  const sectionOrMixed = DAY_SECTION_MAP[dayOfWeek] ?? 'mixed'

  // Filter pool by section (or use full pool for 'mixed' Sunday)
  const filtered = sectionOrMixed === 'mixed'
    ? pool
    : pool.filter(q => q.section === sectionOrMixed)

  // Fallback: if no questions for that section, use full pool
  const candidates = filtered.length > 0 ? filtered : pool

  // Deterministic selection via hash
  const hash = hashDateString(dateString)
  const index = hash % candidates.length
  const question = candidates[index]

  const section: Section = question.section
  const sectionLabel = SECTION_META[section]?.label ?? section

  return {
    question,
    section,
    sectionLabel,
    dateString,
  }
}
