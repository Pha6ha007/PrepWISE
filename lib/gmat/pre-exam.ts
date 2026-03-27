// lib/gmat/pre-exam.ts
// Prepwise — Pre-Exam Mode (7 days before test)
// Generates a structured 7-day countdown plan when the user's
// test date is within 7 days. Focuses on review, confidence
// building, mock tests, and rest — no new material.

// ── Types ────────────────────────────────────────────────────

export interface PreExamPlan {
  isActive: boolean
  daysUntilExam: number
  dailyPlan: PreExamDay[]
  focusAreas: string[]  // top 3 weak spots
  mockTestSchedule: { day: number; completed: boolean }[]
  mindsetTips: string[]
}

export interface PreExamDay {
  day: number           // 7, 6, 5, 4, 3, 2, 1
  date: string          // ISO date string for this day
  focus: string         // "DS Decision Tree", "RC Timing", "Mock Test", "Light Review", "Rest"
  activities: string[]
  durationMinutes: number
  isMockTestDay: boolean
  isRestDay: boolean
}

// ── Mindset Tips ─────────────────────────────────────────────

const MINDSET_TIPS: Record<number, string> = {
  7: "This week is about sharpening, not learning new things. You already know the material.",
  6: "Treat this mock like the real test. Full focus, timed, no breaks.",
  5: "Reviewing mock errors is the highest-value activity right now.",
  4: "You're in great shape. Just tighten the loose ends.",
  3: "Last mock. Whatever you score, remember — it's practice, not prediction.",
  2: "Light touch only. Flip through formulas. No hard problems.",
  1: "You're ready. Sleep well. Tomorrow you show what you know.",
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Calculate the number of calendar days between now and the test date.
 * Returns 0 on the test day itself, negative if the date has passed.
 */
export function daysUntilExam(testDate: string): number {
  const now = new Date()
  const test = new Date(testDate)

  // Strip time, compare calendar dates in local timezone
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const testDateOnly = new Date(test.getFullYear(), test.getMonth(), test.getDate())

  const diffMs = testDateOnly.getTime() - nowDate.getTime()
  return Math.round(diffMs / (24 * 60 * 60 * 1000))
}

/**
 * Check whether pre-exam mode should be active.
 */
export function isPreExamMode(testDate: string | null | undefined): boolean {
  if (!testDate) return false
  const days = daysUntilExam(testDate)
  return days >= 1 && days <= 7
}

/**
 * Pick the top 3 weak topics from the provided list.
 * Falls back to generic areas if fewer than 3 are available.
 */
function pickFocusAreas(weakTopics: string[]): string[] {
  const defaults = ['Mixed Practice', 'Timed Problem Sets', 'Error Pattern Review']
  if (weakTopics.length === 0) return defaults
  const areas = weakTopics.slice(0, 3)
  while (areas.length < 3) {
    areas.push(defaults[areas.length])
  }
  return areas
}

/**
 * Build the ISO date string for a given countdown day.
 * Day 7 = today (if 7 days until exam), Day 1 = eve of the exam.
 */
function dateForCountdownDay(testDate: string, countdownDay: number): string {
  const test = new Date(testDate)
  const dayDate = new Date(test)
  // countdownDay = days before the exam. Day 1 = 1 day before exam (the eve).
  dayDate.setDate(test.getDate() - countdownDay)
  return dayDate.toISOString().split('T')[0]
}

// ── Plan Builder ─────────────────────────────────────────────

function buildDay7(focusAreas: string[], date: string): PreExamDay {
  return {
    day: 7,
    date,
    focus: focusAreas[0],
    activities: [
      `Targeted practice: ${focusAreas[0]} — 40 minutes`,
      'Review mistakes from last 2 weeks of practice',
      'Quick formula refresher (10 min)',
      'Error log review — find your top 3 recurring mistakes',
    ],
    durationMinutes: 60,
    isMockTestDay: false,
    isRestDay: false,
  }
}

function buildDay6(date: string, mockTestNumber: number): PreExamDay {
  return {
    day: 6,
    date,
    focus: `Full Mock Test #${mockTestNumber}`,
    activities: [
      'Full-length GMAT mock test under timed conditions',
      'Simulate test day: quiet environment, no interruptions',
      'Choose your section order (practice your planned order)',
      'Take 10-minute breaks between sections, just like the real test',
    ],
    durationMinutes: 150,
    isMockTestDay: true,
    isRestDay: false,
  }
}

function buildDay5(focusAreas: string[], date: string): PreExamDay {
  return {
    day: 5,
    date,
    focus: `Mock Review + ${focusAreas[1]}`,
    activities: [
      'Detailed review of yesterday\'s mock test — every wrong answer',
      'Categorize errors: careless, conceptual, timing, or trap',
      `Focused drill: ${focusAreas[1]} — 20 minutes`,
      'Update your error log with new patterns',
    ],
    durationMinutes: 60,
    isMockTestDay: false,
    isRestDay: false,
  }
}

function buildDay4(focusAreas: string[], date: string): PreExamDay {
  return {
    day: 4,
    date,
    focus: `${focusAreas[2]} + Mixed Practice`,
    activities: [
      `Focused drill: ${focusAreas[2]} — 20 minutes`,
      'Mixed practice set: 15 questions across all sections, timed',
      'Practice your guessing strategy on hard questions',
    ],
    durationMinutes: 45,
    isMockTestDay: false,
    isRestDay: false,
  }
}

function buildDay3(date: string, mockTestNumber: number): PreExamDay {
  return {
    day: 3,
    date,
    focus: `Full Mock Test #${mockTestNumber}`,
    activities: [
      'Final full-length mock test — your last dress rehearsal',
      'Full test-day simulation: arrival routine, breaks, pacing',
      'Focus on time management more than getting every question right',
      'After the test: brief review of flagged questions only',
    ],
    durationMinutes: 150,
    isMockTestDay: true,
    isRestDay: false,
  }
}

function buildDay2(date: string): PreExamDay {
  return {
    day: 2,
    date,
    focus: 'Light Review',
    activities: [
      'Flip through formula sheet — no memorization pressure, just recognition',
      'Review your key strategies for each section (section order, pacing, guessing)',
      'Read through your "insight moments" — things that clicked',
      'NO new problems. NO hard questions. Just gentle review.',
    ],
    durationMinutes: 30,
    isMockTestDay: false,
    isRestDay: false,
  }
}

function buildDay1(date: string): PreExamDay {
  return {
    day: 1,
    date,
    focus: 'Rest',
    activities: [
      'No studying. You\'ve done the work.',
      'Prepare your test-day logistics: ID, directions, snacks, layers',
      'Light exercise or a walk to clear your mind',
      'Go to bed early — aim for 8 hours of sleep',
      'Sam says: "You\'ve done the work. Trust your preparation. Get 8 hours of sleep."',
    ],
    durationMinutes: 0,
    isMockTestDay: false,
    isRestDay: true,
  }
}

// ── Main Generator ───────────────────────────────────────────

export function generatePreExamPlan(
  testDate: string,
  weakTopics: string[],
  currentAccuracy: Record<string, number>,
  mockTestsTaken: number,
): PreExamPlan {
  const days = daysUntilExam(testDate)

  if (days < 1 || days > 7) {
    return {
      isActive: false,
      daysUntilExam: days,
      dailyPlan: [],
      focusAreas: [],
      mockTestSchedule: [],
      mindsetTips: [],
    }
  }

  // Sort weak topics by accuracy (lowest first) to prioritize the weakest
  const sortedWeakTopics = [...weakTopics].sort((a, b) => {
    const accA = currentAccuracy[a] ?? 50
    const accB = currentAccuracy[b] ?? 50
    return accA - accB
  })

  const focusAreas = pickFocusAreas(sortedWeakTopics)

  // Mock test numbering continues from what the user has already taken
  const nextMockNumber = mockTestsTaken + 1

  // Build the full 7-day plan
  const fullPlan: PreExamDay[] = [
    buildDay7(focusAreas, dateForCountdownDay(testDate, 7)),
    buildDay6(dateForCountdownDay(testDate, 6), nextMockNumber),
    buildDay5(focusAreas, dateForCountdownDay(testDate, 5)),
    buildDay4(focusAreas, dateForCountdownDay(testDate, 4)),
    buildDay3(dateForCountdownDay(testDate, 3), nextMockNumber + 1),
    buildDay2(dateForCountdownDay(testDate, 2)),
    buildDay1(dateForCountdownDay(testDate, 1)),
  ]

  // Filter to only include days that are today or in the future.
  // If today is Day 4 (4 days until exam), we show Days 4, 3, 2, 1.
  const dailyPlan = fullPlan.filter(d => d.day <= days)

  // Build mindset tips for active days
  const mindsetTips = dailyPlan.map(d => MINDSET_TIPS[d.day])

  // Mock test schedule
  const mockTestSchedule = [
    { day: 6, completed: days < 6 },  // Day 6 mock is complete if we're past it
    { day: 3, completed: days < 3 },  // Day 3 mock is complete if we're past it
  ]

  return {
    isActive: true,
    daysUntilExam: days,
    dailyPlan,
    focusAreas,
    mockTestSchedule,
    mindsetTips,
  }
}

/**
 * Get today's plan day from a PreExamPlan, if one exists.
 */
export function getTodaysPlan(plan: PreExamPlan): PreExamDay | null {
  if (!plan.isActive || plan.dailyPlan.length === 0) return null
  // The first item in dailyPlan corresponds to the current day (highest countdown day remaining)
  return plan.dailyPlan[0]
}

/**
 * Get today's mindset tip from a PreExamPlan.
 */
export function getTodaysMindsetTip(plan: PreExamPlan): string | null {
  if (!plan.isActive || plan.daysUntilExam < 1 || plan.daysUntilExam > 7) return null
  return MINDSET_TIPS[plan.daysUntilExam] ?? null
}
