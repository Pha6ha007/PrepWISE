import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type Section, type QuestionType, type Difficulty } from '@/lib/gmat/question-types'
import {
  getQuestions,
  getAdaptiveQuestions,
  getQuestionCount,
  getRandomQuestions,
  stripAnswers,
  getAnswer,
} from '@/lib/gmat/question-bank'

/**
 * GET /api/practice/questions?section=quant&type=PS&difficulty=medium&limit=10
 *                            &mode=adaptive&currentDifficulty=medium
 *
 * Returns questions filtered by parameters.
 * When mode=adaptive, uses adaptive difficulty selection for mock tests.
 * When mode=count, returns only the question count (no questions).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const section = searchParams.get('section') as Section | null
  const type = searchParams.get('type') as QuestionType | null
  const difficulty = searchParams.get('difficulty') as Difficulty | null
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const mode = searchParams.get('mode')

  // Count-only mode
  if (mode === 'count') {
    return NextResponse.json({
      count: getQuestionCount(section ?? undefined),
    })
  }

  // Adaptive mode for mock test engine
  if (mode === 'adaptive') {
    const currentDifficulty = (searchParams.get('currentDifficulty') as Difficulty) || 'medium'
    if (!section) {
      return NextResponse.json(
        { error: 'section is required for adaptive mode' },
        { status: 400 }
      )
    }
    const questions = getAdaptiveQuestions(section, currentDifficulty, limit)
    return NextResponse.json({
      questions,
      count: questions.length,
      totalAvailable: getQuestionCount(section),
    })
  }

  // Standard filtered mode
  const questions = getQuestions({
    section: section ?? undefined,
    type: type ?? undefined,
    difficulty: difficulty ?? undefined,
    limit,
  })

  return NextResponse.json({
    questions,
    count: questions.length,
    totalAvailable: getQuestionCount(section ?? undefined),
  })
}

/**
 * POST /api/practice/questions
 * Body: { questionId: string }
 *
 * Returns the correct answer for a submitted question.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { questionId } = body

    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json(
        { error: 'questionId is required' },
        { status: 400 }
      )
    }

    const answer = getAnswer(questionId)
    if (!answer) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(answer)
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
