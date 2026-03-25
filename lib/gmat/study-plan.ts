// lib/gmat/study-plan.ts
// Personalized GMAT Focus Edition study plan generator.
// Rule-based — no AI calls needed.

import { GMAT_TOPICS, GMAT_SECTIONS, getTopicsForSection, type GmatTopic } from './topics'

// ── Types ────────────────────────────────────────────────────

export interface StudyPlanInput {
  targetScore: number        // 205-805
  currentScore?: number      // from diagnostic
  testDate?: string          // ISO date
  hoursPerWeek: number       // 5-30
  weakSections: string[]     // ['quant', 'verbal', 'data-insights']
  weakTopics: string[]       // specific topic IDs
}

export interface StudyPlan {
  id: string
  totalWeeks: number
  hoursPerWeek: number
  phases: StudyPhase[]
  weeklySchedule: WeekPlan[]
  estimatedScoreGain: number
  createdAt: string
}

export interface StudyPhase {
  name: string              // 'Foundation', 'Core Skills', 'Practice & Review', 'Mock Tests & Polish'
  weeks: number
  focus: string
  description: string
}

export interface WeekPlan {
  week: number
  phase: string
  topics: DayPlan[]
  practiceGoal: number      // questions to complete
  mockTest?: boolean
}

export interface DayPlan {
  day: string               // 'Mon', 'Tue', etc.
  section: string
  topic: string
  activity: 'lesson' | 'practice' | 'review' | 'mock-test' | 'rest'
  durationMinutes: number
  description: string
}

// ── Constants ────────────────────────────────────────────────

const STUDY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const REST_DAY = 'Sun'

const PHASE_DEFINITIONS = [
  {
    name: 'Foundation',
    fraction: 0.25,
    focus: 'Build fundamentals in weak areas',
    description: 'Focus on understanding core concepts and building a solid base in your weakest sections. Short practice sets to reinforce learning.',
  },
  {
    name: 'Core Skills',
    fraction: 0.35,
    focus: 'Develop all sections with weak-area emphasis',
    description: 'Work through all topic areas with extra time on weak spots. Begin timed practice and learn test-taking strategies.',
  },
  {
    name: 'Practice & Review',
    fraction: 0.25,
    focus: 'Heavy question practice and error analysis',
    description: 'High-volume question practice under timed conditions. Analyze error patterns and refine your approach to each question type.',
  },
  {
    name: 'Mock Tests & Polish',
    fraction: 0.15,
    focus: 'Full-length mocks and targeted review',
    description: 'Take full-length practice tests to build stamina and timing. Review mistakes and do targeted drills on remaining weak spots.',
  },
] as const

// ── Helpers ──────────────────────────────────────────────────

function generateId(): string {
  return `sp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function weeksUntil(dateStr?: string): number {
  if (!dateStr) return 10 // default
  const now = new Date()
  const target = new Date(dateStr)
  const diffMs = target.getTime() - now.getTime()
  const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
  return Math.max(4, Math.min(24, weeks)) // clamp 4-24 weeks
}

function estimateScoreGain(totalWeeks: number, hoursPerWeek: number, currentScore?: number): number {
  // Rough heuristic: more hours + more weeks = more gain, with diminishing returns
  const totalHours = totalWeeks * hoursPerWeek
  const baseGain = Math.min(200, Math.round(totalHours * 0.8))
  // Lower scores have more room for improvement
  const currentFactor = currentScore ? Math.max(0.5, (805 - currentScore) / 600) : 0.7
  return Math.round(baseGain * currentFactor)
}

/** Distribute total weeks across 4 phases, ensuring each has at least 1 week */
function distributePhaseWeeks(totalWeeks: number): number[] {
  const raw = PHASE_DEFINITIONS.map(p => p.fraction * totalWeeks)
  const floored = raw.map(w => Math.max(1, Math.floor(w)))

  // Distribute remaining weeks to larger phases
  let remaining = totalWeeks - floored.reduce((a, b) => a + b, 0)
  let idx = 1 // start with Core Skills (largest phase)
  while (remaining > 0) {
    floored[idx]++
    remaining--
    idx = (idx + 2) % 4 // alternate: Core Skills, Practice, Foundation, Mock
    if (idx === 0) idx = 1
  }

  return floored
}

/**
 * Build a pool of topics ordered by priority (weak first).
 * Returns pairs of [sectionId, topicName] for scheduling.
 */
function buildTopicPool(
  weakSections: string[],
  weakTopics: string[],
): Array<{ section: string; topicId: string; topicName: string; isWeak: boolean }> {
  const allSections = GMAT_SECTIONS.map(s => s.id)
  const pool: Array<{ section: string; topicId: string; topicName: string; isWeak: boolean }> = []

  // Weak topics first
  for (const topicId of weakTopics) {
    const topic = GMAT_TOPICS.find(t => t.id === topicId)
    if (topic) {
      pool.push({ section: topic.section, topicId: topic.id, topicName: topic.name, isWeak: true })
    }
  }

  // Remaining topics from weak sections
  for (const sectionId of weakSections) {
    const sectionTopics = getTopicsForSection(sectionId as GmatTopic['section'])
    for (const topic of sectionTopics) {
      if (!pool.some(p => p.topicId === topic.id)) {
        pool.push({ section: topic.section, topicId: topic.id, topicName: topic.name, isWeak: true })
      }
    }
  }

  // Non-weak sections/topics
  for (const sectionId of allSections) {
    if (weakSections.includes(sectionId)) continue
    const sectionTopics = getTopicsForSection(sectionId as GmatTopic['section'])
    for (const topic of sectionTopics) {
      if (!pool.some(p => p.topicId === topic.id)) {
        pool.push({ section: topic.section, topicId: topic.id, topicName: topic.name, isWeak: false })
      }
    }
  }

  return pool
}

/** Compute per-day minutes for study days, given weekly hours */
function dailyMinutes(hoursPerWeek: number): number {
  // 6 study days per week
  return Math.round((hoursPerWeek * 60) / STUDY_DAYS.length)
}

/** Get the activity type appropriate for a given phase */
function activityForPhase(phaseName: string, isMockDay: boolean): DayPlan['activity'] {
  if (isMockDay) return 'mock-test'
  switch (phaseName) {
    case 'Foundation': return 'lesson'
    case 'Core Skills': return 'practice'
    case 'Practice & Review': return 'practice'
    case 'Mock Tests & Polish': return 'review'
    default: return 'practice'
  }
}

/** Get description for a day's activity */
function activityDescription(
  activity: DayPlan['activity'],
  topicName: string,
  phaseName: string,
): string {
  switch (activity) {
    case 'lesson':
      return `Study ${topicName} fundamentals — review concepts and work through examples`
    case 'practice':
      return phaseName === 'Core Skills'
        ? `Timed practice set on ${topicName} — focus on accuracy and approach`
        : `High-volume ${topicName} practice — analyze errors and refine strategies`
    case 'review':
      return `Targeted review of ${topicName} — revisit mistakes and solidify weak points`
    case 'mock-test':
      return 'Full-length GMAT Focus practice test — simulate real test conditions'
    case 'rest':
      return 'Rest day — light review of notes or flashcards if desired'
  }
}

/** Practice question goals ramp up through weeks */
function practiceGoalForWeek(week: number, totalWeeks: number): number {
  const progress = week / totalWeeks
  if (progress < 0.25) return 15
  if (progress < 0.6) return 25
  if (progress < 0.85) return 35
  return 20 // taper in final phase
}

// ── Main Generator ───────────────────────────────────────────

export function generateStudyPlan(input: StudyPlanInput): StudyPlan {
  const {
    targetScore,
    currentScore,
    testDate,
    hoursPerWeek,
    weakSections,
    weakTopics,
  } = input

  const totalWeeks = weeksUntil(testDate)
  const phaseWeeks = distributePhaseWeeks(totalWeeks)
  const topicPool = buildTopicPool(weakSections, weakTopics)
  const dayMins = dailyMinutes(hoursPerWeek)

  // Build phases
  const phases: StudyPhase[] = PHASE_DEFINITIONS.map((def, i) => ({
    name: def.name,
    weeks: phaseWeeks[i],
    focus: def.focus,
    description: def.description,
  }))

  // Build weekly schedule
  const weeklySchedule: WeekPlan[] = []
  let weekNumber = 0

  // Topic cycling indices — weak topics cycle faster
  const weakPool = topicPool.filter(t => t.isWeak)
  const strongPool = topicPool.filter(t => !t.isWeak)
  let weakIdx = 0
  let strongIdx = 0

  for (let phaseIdx = 0; phaseIdx < phases.length; phaseIdx++) {
    const phase = phases[phaseIdx]
    const phaseName = phase.name

    for (let w = 0; w < phase.weeks; w++) {
      weekNumber++

      // Determine if this week has a mock test (Phase 3-4, every 1-2 weeks)
      const isMockPhase = phaseIdx >= 2
      const mockTest = isMockPhase && (phaseIdx === 3 || w % 2 === 1)

      const days: DayPlan[] = []

      for (let d = 0; d < STUDY_DAYS.length; d++) {
        const dayName = STUDY_DAYS[d]

        // Saturday in mock weeks = mock test day
        const isMockDay = mockTest && dayName === 'Sat'

        if (isMockDay) {
          days.push({
            day: dayName,
            section: 'all',
            topic: 'Full Mock Test',
            activity: 'mock-test',
            durationMinutes: Math.max(dayMins, 120), // at least 2 hours for a mock
            description: activityDescription('mock-test', '', phaseName),
          })
          continue
        }

        // Allocate ~60% of days to weak topics, ~40% to strong
        const useWeak = d < Math.ceil(STUDY_DAYS.length * 0.6) || strongPool.length === 0

        let topicEntry: typeof topicPool[0]
        if (useWeak && weakPool.length > 0) {
          topicEntry = weakPool[weakIdx % weakPool.length]
          weakIdx++
        } else if (strongPool.length > 0) {
          topicEntry = strongPool[strongIdx % strongPool.length]
          strongIdx++
        } else {
          // fallback — all topics are weak
          topicEntry = topicPool[weekNumber % topicPool.length]
        }

        const activity = activityForPhase(phaseName, false)

        days.push({
          day: dayName,
          section: topicEntry.section,
          topic: topicEntry.topicName,
          activity,
          durationMinutes: dayMins,
          description: activityDescription(activity, topicEntry.topicName, phaseName),
        })
      }

      // Rest day
      days.push({
        day: REST_DAY,
        section: '',
        topic: '',
        activity: 'rest',
        durationMinutes: 0,
        description: activityDescription('rest', '', phaseName),
      })

      weeklySchedule.push({
        week: weekNumber,
        phase: phaseName,
        topics: days,
        practiceGoal: practiceGoalForWeek(weekNumber, totalWeeks),
        mockTest: mockTest || undefined,
      })
    }
  }

  return {
    id: generateId(),
    totalWeeks,
    hoursPerWeek,
    phases,
    weeklySchedule,
    estimatedScoreGain: estimateScoreGain(totalWeeks, hoursPerWeek, currentScore),
    createdAt: new Date().toISOString(),
  }
}
