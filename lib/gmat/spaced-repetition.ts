// lib/gmat/spaced-repetition.ts
// Prepwise — FSRS (Free Spaced Repetition Scheduler) integration for GMAT topics
// Uses ts-fsrs to schedule optimal review intervals for each topic/subtopic.
//
// Each GMAT topic the user practices becomes an FSRS card.
// Sam uses this to decide: "What should you review today?"

import {
  createEmptyCard,
  FSRS,
  Rating,
  type Card,
  type RecordLogItem,
  type Grade,
} from 'ts-fsrs'

// ── Types ──────────────────────────────────────────────────

export interface ReviewCard {
  topicId: string
  subtopic: string | null
  section: string
  card: Card
  lastRating: Rating | null
  reviewCount: number
}

export interface ReviewSchedule {
  dueNow: ReviewCard[]       // Cards due for review right now
  dueToday: ReviewCard[]     // Due later today
  upcoming: ReviewCard[]     // Due in next 7 days
  mastered: ReviewCard[]     // High stability, not due soon
}

export interface ReviewResult {
  card: Card
  rating: Rating
  nextReviewDate: Date
  stabilityDays: number
}

// ── FSRS Engine ────────────────────────────────────────────

// Create a tuned FSRS instance for GMAT study patterns
// Default parameters work well; can be personalized per user later
const fsrs = new FSRS({})

/**
 * Create a new FSRS card for a topic the user encounters for the first time.
 */
export function createTopicCard(
  topicId: string,
  subtopic: string | null,
  section: string
): ReviewCard {
  return {
    topicId,
    subtopic,
    section,
    card: createEmptyCard(),
    lastRating: null,
    reviewCount: 0,
  }
}

/**
 * Record a review for a card based on how the user performed.
 *
 * Maps GMAT practice accuracy to FSRS ratings:
 * - Wrong + concept error → Again (1)
 * - Wrong + careless error → Hard (2)
 * - Correct but slow → Good (3)
 * - Correct and confident → Easy (4)
 */
export function recordReview(
  reviewCard: ReviewCard,
  accuracy: 'wrong_concept' | 'wrong_careless' | 'correct_slow' | 'correct_confident',
  now?: Date
): ReviewResult {
  const ratingMap: Record<string, Rating> = {
    wrong_concept: Rating.Again,
    wrong_careless: Rating.Hard,
    correct_slow: Rating.Good,
    correct_confident: Rating.Easy,
  }

  const rating = ratingMap[accuracy]
  const reviewDate = now || new Date()
  // Use next() which accepts Grade directly (ts-fsrs v5 API)
  const result: RecordLogItem = fsrs.next(reviewCard.card, reviewDate, rating as Grade)

  return {
    card: result.card,
    rating,
    nextReviewDate: result.card.due,
    stabilityDays: result.card.stability,
  }
}

/**
 * Get the retrievability (probability of recall) for a card at a given time.
 * Returns 0.0 - 1.0 where 1.0 = perfect recall.
 */
export function getRetrievability(card: Card, now?: Date): number {
  const reviewDate = now || new Date()
  return fsrs.get_retrievability(card, reviewDate, false) ?? 1.0
}

/**
 * Build a review schedule from a collection of user's cards.
 * Organizes them by urgency: due now → due today → upcoming → mastered.
 */
export function buildReviewSchedule(
  cards: ReviewCard[],
  now?: Date
): ReviewSchedule {
  const reviewDate = now || new Date()
  const todayEnd = new Date(reviewDate)
  todayEnd.setHours(23, 59, 59, 999)

  const oneWeekLater = new Date(reviewDate)
  oneWeekLater.setDate(oneWeekLater.getDate() + 7)

  const schedule: ReviewSchedule = {
    dueNow: [],
    dueToday: [],
    upcoming: [],
    mastered: [],
  }

  for (const rc of cards) {
    const due = rc.card.due

    if (due <= reviewDate) {
      schedule.dueNow.push(rc)
    } else if (due <= todayEnd) {
      schedule.dueToday.push(rc)
    } else if (due <= oneWeekLater) {
      schedule.upcoming.push(rc)
    } else {
      schedule.mastered.push(rc)
    }
  }

  // Sort due-now by lowest retrievability first (most urgent)
  schedule.dueNow.sort((a, b) => {
    const ra = getRetrievability(a.card, reviewDate)
    const rb = getRetrievability(b.card, reviewDate)
    return ra - rb
  })

  return schedule
}

/**
 * Convert user's topic progress from DB into FSRS cards.
 * Used to hydrate the system from existing practice data.
 */
export function hydrateCardFromProgress(
  topicId: string,
  subtopic: string | null,
  section: string,
  accuracy: number,
  totalAttempts: number,
  lastPracticed: Date | null
): ReviewCard {
  // Create card and simulate past reviews based on accuracy
  let card = createEmptyCard(lastPracticed || new Date())

  if (totalAttempts > 0 && lastPracticed) {
    // Simulate a review that reflects cumulative performance
    const rating = accuracy >= 0.85 ? Rating.Easy
      : accuracy >= 0.65 ? Rating.Good
      : accuracy >= 0.4 ? Rating.Hard
      : Rating.Again

    const result = fsrs.next(card, lastPracticed, rating as Grade)
    card = result.card
  }

  return {
    topicId,
    subtopic,
    section,
    card,
    lastRating: null,
    reviewCount: totalAttempts,
  }
}

/**
 * Map FSRS rating to human-readable label for UI.
 */
export function getRatingLabel(rating: Rating): string {
  switch (rating) {
    case Rating.Again: return 'Forgot'
    case Rating.Hard: return 'Hard'
    case Rating.Good: return 'Good'
    case Rating.Easy: return 'Easy'
    default: return 'Unknown'
  }
}

/**
 * Get a color class for a rating.
 */
export function getRatingColor(rating: Rating): string {
  switch (rating) {
    case Rating.Again: return 'text-red-400'
    case Rating.Hard: return 'text-amber-400'
    case Rating.Good: return 'text-cyan-400'
    case Rating.Easy: return 'text-emerald-400'
    default: return 'text-slate-400'
  }
}

/**
 * Generate Sam's recommendation based on review schedule.
 */
export function generateStudyRecommendation(schedule: ReviewSchedule): string {
  const { dueNow, dueToday, upcoming, mastered } = schedule

  if (dueNow.length === 0 && dueToday.length === 0) {
    if (mastered.length > 0) {
      return "All caught up! Your topics are well-retained. Try a new topic or do a mock test."
    }
    return "No reviews due. Start practicing a new topic to build your schedule."
  }

  const urgentSections = [...new Set(dueNow.map(c => c.section))]
  const topicNames = dueNow.slice(0, 3).map(c => c.topicId.replace(/-/g, ' '))

  if (dueNow.length >= 5) {
    return `You have ${dueNow.length} topics slipping — focus on ${urgentSections.join(' and ')} today. Start with ${topicNames[0]}.`
  }

  if (dueNow.length > 0) {
    return `${dueNow.length} topic${dueNow.length > 1 ? 's' : ''} due for review: ${topicNames.join(', ')}. ${dueToday.length > 0 ? `Plus ${dueToday.length} more later today.` : ''}`
  }

  return `${dueToday.length} review${dueToday.length > 1 ? 's' : ''} scheduled for today. ${upcoming.length} more this week.`
}
