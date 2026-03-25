import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateStudyPlan, type StudyPlanInput, type StudyPlan } from '@/lib/gmat/study-plan'

/**
 * GET /api/study-plan
 * Returns the user's current study plan stored in gmatProfile JSON.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { gmatProfile: true },
    })

    const profile = (dbUser?.gmatProfile ?? {}) as Record<string, unknown>
    const studyPlan = (profile.studyPlan as StudyPlan | undefined) ?? null
    const completedDays = (profile.completedDays as string[] | undefined) ?? []

    return NextResponse.json({ studyPlan, completedDays })
  } catch (error) {
    console.error('[study-plan] GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/study-plan
 * Body: StudyPlanInput
 * Generates a new plan and saves it to the user's gmatProfile JSON.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as StudyPlanInput

    // Validate required fields
    if (!body.hoursPerWeek || body.hoursPerWeek < 5 || body.hoursPerWeek > 30) {
      return NextResponse.json(
        { error: 'hoursPerWeek must be between 5 and 30' },
        { status: 400 },
      )
    }
    if (!body.targetScore || body.targetScore < 205 || body.targetScore > 805) {
      return NextResponse.json(
        { error: 'targetScore must be between 205 and 805' },
        { status: 400 },
      )
    }
    if (!Array.isArray(body.weakSections) || body.weakSections.length === 0) {
      return NextResponse.json(
        { error: 'At least one weak section is required' },
        { status: 400 },
      )
    }

    const plan = generateStudyPlan(body)

    // Merge into existing gmatProfile JSON
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { gmatProfile: true },
    })

    const existingProfile = (dbUser?.gmatProfile ?? {}) as Record<string, unknown>

    await prisma.user.update({
      where: { id: user.id },
      data: {
        gmatProfile: JSON.parse(JSON.stringify({
          ...existingProfile,
          studyPlan: plan,
          completedDays: [],
        })),
      },
    })

    return NextResponse.json({ studyPlan: plan })
  } catch (error) {
    console.error('[study-plan] POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/study-plan
 * Body: { dayKey: string } — toggle a day as completed.
 * dayKey format: "week-{n}-{day}" e.g. "week-3-Mon"
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dayKey } = body as { dayKey: string }

    if (!dayKey || typeof dayKey !== 'string') {
      return NextResponse.json({ error: 'dayKey is required' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { gmatProfile: true },
    })

    const profile = (dbUser?.gmatProfile ?? {}) as Record<string, unknown>
    const completedDays = (profile.completedDays as string[] | undefined) ?? []

    // Toggle
    const updated = completedDays.includes(dayKey)
      ? completedDays.filter(d => d !== dayKey)
      : [...completedDays, dayKey]

    await prisma.user.update({
      where: { id: user.id },
      data: {
        gmatProfile: JSON.parse(JSON.stringify({
          ...profile,
          completedDays: updated,
        })),
      },
    })

    return NextResponse.json({ completedDays: updated })
  } catch (error) {
    console.error('[study-plan] PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
