import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/review — Get user's FSRS review schedule
 * Returns cards hydrated from TopicProgress, organized by urgency.
 *
 * POST /api/review — Record a review rating
 * Body: { topicId: string, subtopic?: string, accuracy: string }
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { prisma } = await import('@/lib/prisma')
    const {
      hydrateCardFromProgress,
      buildReviewSchedule,
      generateStudyRecommendation,
    } = await import('@/lib/gmat/spaced-repetition')

    // Fetch all user's topic progress
    const progress = await prisma.topicProgress.findMany({
      where: { userId: user.id },
    })

    // Hydrate FSRS cards from existing progress data
    const cards = progress.map(tp =>
      hydrateCardFromProgress(
        tp.topic,
        tp.subtopic,
        tp.section,
        tp.accuracy,
        tp.totalAttempts,
        tp.lastPracticed,
      )
    )

    const schedule = buildReviewSchedule(cards)
    const recommendation = generateStudyRecommendation(schedule)

    return NextResponse.json({
      schedule: {
        dueNow: schedule.dueNow.map(serializeCard),
        dueToday: schedule.dueToday.map(serializeCard),
        upcoming: schedule.upcoming.map(serializeCard),
        mastered: schedule.mastered.map(serializeCard),
      },
      recommendation,
      totalCards: cards.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { prisma } = await import('@/lib/prisma')
    const { recordReview, hydrateCardFromProgress } = await import('@/lib/gmat/spaced-repetition')

    const body = await request.json()
    const { topicId, subtopic, section, accuracy } = body

    if (!topicId || !section || !accuracy) {
      return NextResponse.json(
        { error: 'Missing required fields: topicId, section, accuracy' },
        { status: 400 }
      )
    }

    // Get or create topic progress
    let tp = await prisma.topicProgress.findFirst({
      where: {
        userId: user.id,
        section,
        topic: topicId,
        subtopic: subtopic || null,
      },
    })

    if (!tp) {
      tp = await prisma.topicProgress.create({
        data: {
          userId: user.id,
          section,
          topic: topicId,
          subtopic: subtopic || null,
          totalAttempts: 0,
          correctAttempts: 0,
          accuracy: 0,
          masteryLevel: 'learning',
          lastPracticed: new Date(),
        },
      })
    }

    // Hydrate FSRS card from current progress
    const card = hydrateCardFromProgress(
      tp.topic,
      tp.subtopic,
      tp.section,
      tp.accuracy,
      tp.totalAttempts,
      tp.lastPracticed,
    )

    // Record the review
    const result = recordReview(card, accuracy)

    // Update topic progress
    const isCorrect = accuracy === 'correct_slow' || accuracy === 'correct_confident'
    const newTotal = tp.totalAttempts + 1
    const newCorrect = tp.correctAttempts + (isCorrect ? 1 : 0)

    // Determine mastery level based on FSRS stability
    let masteryLevel = 'learning'
    if (result.stabilityDays >= 30) masteryLevel = 'mastered'
    else if (result.stabilityDays >= 7) masteryLevel = 'practicing'
    else if (newTotal >= 1) masteryLevel = 'learning'

    await prisma.topicProgress.update({
      where: { id: tp.id },
      data: {
        totalAttempts: newTotal,
        correctAttempts: newCorrect,
        accuracy: newCorrect / newTotal,
        lastPracticed: new Date(),
        masteryLevel,
      },
    })

    return NextResponse.json({
      success: true,
      nextReview: result.nextReviewDate.toISOString(),
      stabilityDays: Math.round(result.stabilityDays * 10) / 10,
      masteryLevel,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function serializeCard(rc: any) {
  return {
    topicId: rc.topicId,
    subtopic: rc.subtopic,
    section: rc.section,
    due: rc.card.due?.toISOString(),
    stability: rc.card.stability,
    difficulty: rc.card.difficulty,
    reviewCount: rc.reviewCount,
  }
}
