// lib/gmat/gamification.ts
// Gamification engine — streaks, daily challenges, achievements
// Client-safe: no fs/path imports, no server-only dependencies.

import type { GmatQuestion, Section } from './question-types'
import { SAMPLE_QUESTIONS } from './question-types'

// ── Types ──────────────────────────────────────────────────

export interface StreakData {
  currentStreak: number       // consecutive days studied
  longestStreak: number
  todayCompleted: boolean
  weeklyGoal: number          // days per week target (default 5)
  weeklyProgress: number      // days completed this week (Mon–Sun)
  totalStudyDays: number
  lastStudyDate: string | null // YYYY-MM-DD
}

export interface DailyChallenge {
  id: string
  date: string                // YYYY-MM-DD
  section: Section
  topic: string
  question: GmatQuestion
  completed: boolean
  correct: boolean | null
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string                // emoji
  unlockedAt: string | null
  requirement: string
}

export interface UserStats {
  totalQuestions: number
  totalCorrect: number
  currentStreak: number
  longestStreak: number
  consecutiveCorrect: number  // current run of correct answers
  mockTestsTaken: number
  highestMockScore: number
  sectionsToday: Set<Section>
  studyHour: number           // 0-23, hour of day the session started
  totalStudyDays: number
}

// ── Achievements ───────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-session',
    name: 'First Steps',
    description: 'Complete your first practice session',
    icon: '🎯',
    unlockedAt: null,
    requirement: '1 practice session',
  },
  {
    id: 'streak-3',
    name: 'Getting Consistent',
    description: '3-day study streak',
    icon: '🔥',
    unlockedAt: null,
    requirement: '3-day streak',
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: '7-day study streak',
    icon: '⚡',
    unlockedAt: null,
    requirement: '7-day streak',
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: '30-day study streak',
    icon: '🏆',
    unlockedAt: null,
    requirement: '30-day streak',
  },
  {
    id: 'questions-50',
    name: 'Half Century',
    description: 'Answer 50 questions',
    icon: '📝',
    unlockedAt: null,
    requirement: '50 questions answered',
  },
  {
    id: 'questions-100',
    name: 'Century Club',
    description: 'Answer 100 questions',
    icon: '💯',
    unlockedAt: null,
    requirement: '100 questions answered',
  },
  {
    id: 'questions-500',
    name: 'Question Machine',
    description: 'Answer 500 questions',
    icon: '🚀',
    unlockedAt: null,
    requirement: '500 questions answered',
  },
  {
    id: 'perfect-10',
    name: 'Perfect 10',
    description: 'Get 10 in a row correct',
    icon: '✨',
    unlockedAt: null,
    requirement: '10 consecutive correct',
  },
  {
    id: 'first-mock',
    name: 'Test Day Preview',
    description: 'Complete your first mock test',
    icon: '📋',
    unlockedAt: null,
    requirement: '1 mock test',
  },
  {
    id: 'score-700',
    name: '700 Club',
    description: 'Score 700+ on a mock test',
    icon: '🎓',
    unlockedAt: null,
    requirement: '700+ mock score',
  },
  {
    id: 'all-sections',
    name: 'Well Rounded',
    description: 'Practice all 3 sections in one day',
    icon: '🌟',
    unlockedAt: null,
    requirement: 'All 3 sections in one day',
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Study before 7 AM',
    icon: '🌅',
    unlockedAt: null,
    requirement: 'Study before 7 AM',
  },
]

// ── Helpers ────────────────────────────────────────────────

/** Format a Date to YYYY-MM-DD in local time */
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Get Monday-based week start for a date */
function getWeekStart(d: Date): Date {
  const copy = new Date(d)
  const day = copy.getDay()
  // JS Sunday=0, we want Monday=0
  const diff = day === 0 ? 6 : day - 1
  copy.setDate(copy.getDate() - diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/** Simple deterministic hash for seeding daily challenges */
function hashDateString(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash)
}

// ── Core functions ─────────────────────────────────────────

/**
 * Calculate streak data from an array of study dates (YYYY-MM-DD strings).
 * Dates should be unique and can be in any order.
 */
export function calculateStreak(
  studyDates: string[],
  weeklyGoal: number = 5
): StreakData {
  if (studyDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      todayCompleted: false,
      weeklyGoal,
      weeklyProgress: 0,
      totalStudyDays: 0,
      lastStudyDate: null,
    }
  }

  // Deduplicate and sort descending
  const unique = [...new Set(studyDates)].sort().reverse()
  const today = toDateStr(new Date())
  const yesterday = toDateStr(new Date(Date.now() - 86_400_000))
  const todayCompleted = unique[0] === today

  // Current streak: walk backward from most recent date
  let currentStreak = 0
  const startDate = unique[0] === today ? today : unique[0] === yesterday ? yesterday : null

  if (startDate) {
    const dateSet = new Set(unique)
    const cursor = new Date(startDate + 'T00:00:00')
    while (dateSet.has(toDateStr(cursor))) {
      currentStreak++
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  // Longest streak: scan all dates ascending
  const ascending = [...unique].reverse()
  let longest = 1
  let run = 1
  for (let i = 1; i < ascending.length; i++) {
    const prev = new Date(ascending[i - 1] + 'T00:00:00')
    const curr = new Date(ascending[i] + 'T00:00:00')
    const diffDays = (curr.getTime() - prev.getTime()) / 86_400_000
    if (diffDays === 1) {
      run++
      longest = Math.max(longest, run)
    } else {
      run = 1
    }
  }

  // Weekly progress: count dates in current Mon–Sun week
  const weekStart = getWeekStart(new Date())
  const weekStartStr = toDateStr(weekStart)
  const weeklyProgress = unique.filter((d) => d >= weekStartStr && d <= today).length

  return {
    currentStreak,
    longestStreak: Math.max(longest, currentStreak),
    todayCompleted,
    weeklyGoal,
    weeklyProgress,
    totalStudyDays: unique.length,
    lastStudyDate: unique[0] ?? null,
  }
}

/**
 * Get the daily challenge for a given date.
 * Deterministic: same date always returns the same question.
 * Uses SAMPLE_QUESTIONS as the pool (client-safe, no fs reads).
 */
export function getDailyChallenge(date: string): DailyChallenge {
  const pool = SAMPLE_QUESTIONS
  if (pool.length === 0) {
    throw new Error('No questions available for daily challenge')
  }

  const hash = hashDateString(date)
  const question = pool[hash % pool.length]

  // Rotate section based on day-of-year for variety
  const dayOfYear = Math.floor(
    (new Date(date + 'T00:00:00').getTime() - new Date(date.slice(0, 4) + '-01-01T00:00:00').getTime()) / 86_400_000
  )
  const sections: Section[] = ['quant', 'verbal', 'data-insights']
  const section = sections[dayOfYear % 3]

  return {
    id: `dc-${date}`,
    date,
    section,
    topic: question.topic,
    question,
    completed: false,
    correct: null,
  }
}

/**
 * Check which achievements are unlocked based on user stats.
 * Returns the full achievement list with unlockedAt set for earned ones.
 */
export function checkAchievements(
  stats: UserStats,
  existingUnlocks: Record<string, string> = {} // id → ISO timestamp
): Achievement[] {
  const now = new Date().toISOString()

  const checks: Record<string, boolean> = {
    'first-session': stats.totalQuestions >= 1,
    'streak-3': stats.longestStreak >= 3,
    'streak-7': stats.longestStreak >= 7,
    'streak-30': stats.longestStreak >= 30,
    'questions-50': stats.totalQuestions >= 50,
    'questions-100': stats.totalQuestions >= 100,
    'questions-500': stats.totalQuestions >= 500,
    'perfect-10': stats.consecutiveCorrect >= 10,
    'first-mock': stats.mockTestsTaken >= 1,
    'score-700': stats.highestMockScore >= 700,
    'all-sections': stats.sectionsToday.size >= 3,
    'early-bird': stats.studyHour < 7,
  }

  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlockedAt: existingUnlocks[a.id] ?? (checks[a.id] ? now : null),
  }))
}

/**
 * Get progress toward a specific achievement as a value 0–1.
 * Returns null if achievement has no measurable progress.
 */
export function getAchievementProgress(
  achievementId: string,
  stats: UserStats
): number | null {
  const progressMap: Record<string, [number, number]> = {
    'first-session': [Math.min(stats.totalQuestions, 1), 1],
    'streak-3': [Math.min(stats.currentStreak, 3), 3],
    'streak-7': [Math.min(stats.currentStreak, 7), 7],
    'streak-30': [Math.min(stats.currentStreak, 30), 30],
    'questions-50': [Math.min(stats.totalQuestions, 50), 50],
    'questions-100': [Math.min(stats.totalQuestions, 100), 100],
    'questions-500': [Math.min(stats.totalQuestions, 500), 500],
    'perfect-10': [Math.min(stats.consecutiveCorrect, 10), 10],
    'first-mock': [Math.min(stats.mockTestsTaken, 1), 1],
    'score-700': [Math.min(stats.highestMockScore, 700) / 700, 1],
    'all-sections': [Math.min(stats.sectionsToday.size, 3), 3],
  }

  const entry = progressMap[achievementId]
  if (!entry) return null
  const [current, target] = entry
  return Math.min(current / target, 1)
}
