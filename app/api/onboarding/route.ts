import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Validate onboarding data
const OnboardingSchema = z.object({
  preferredName: z.string().min(1).max(30),
  companionName: z.string().default('Sam'),
  targetScore: z.string().nullable().optional(),
  timeline: z.string().nullable().optional(),
  weakSections: z.array(z.string()).optional(),
  previousScore: z.string().nullable().optional(),
  studyHours: z.string().nullable().optional(),
})

/**
 * SamiWISE Onboarding API
 * Saves the learner's profile, target score, weak areas, and study timeline.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate
    const body = await request.json()
    const validation = OnboardingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.message },
        { status: 400 }
      )
    }

    const {
      preferredName,
      companionName,
      targetScore,
      timeline,
      weakSections,
      previousScore,
      studyHours,
    } = validation.data

    // 3. Parse target score into numeric value
    let targetScoreNum: number | null = null
    if (targetScore) {
      const match = targetScore.match(/(\d+)/)
      if (match) targetScoreNum = parseInt(match[1], 10)
    }

    // 4. Build initial GMAT learner profile
    const initialProfile = {
      weakTopics: weakSections || [],
      strongTopics: [],
      effectiveTechniques: [],
      ineffectiveApproaches: [],
      insightMoments: [],
      conceptLinks: {},
      learningStyle: '',
      explanationPreference: null,
      sessionTopics: [],
      nextSessionPlan: weakSections && weakSections.length > 0
        ? `Start with ${weakSections[0]} assessment`
        : 'Initial diagnostic assessment',
      scoreTrajectory: null,
      timePressureNotes: null,
      commonErrorPatterns: [],
      targetScore: targetScoreNum,
      currentEstimatedScore: null,
      studyHoursPerWeek: studyHours ? parseInt(studyHours, 10) : null,
      testDate: timeline || null,
      preferredDifficulty: null,
    }

    // 5. Create/update user (with free trial for new users)
    const { createTrialDates } = await import('@/lib/billing/trial')
    const trialDates = createTrialDates()

    // Check if user already has trial dates (don't reset on re-onboarding)
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { trialStartDate: true },
    })

    const updatedUser = await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email!,
        preferredName,
        companionName: companionName || 'Sam',
        plan: 'free',
        language: 'en',
        gmatProfile: initialProfile,
        trialStartDate: trialDates.trialStartDate,
        trialEndDate: trialDates.trialEndDate,
      },
      update: {
        preferredName,
        companionName: companionName || 'Sam',
        gmatProfile: initialProfile,
        // Only set trial dates if they haven't been set yet
        ...(existingUser?.trialStartDate ? {} : {
          trialStartDate: trialDates.trialStartDate,
          trialEndDate: trialDates.trialEndDate,
        }),
      },
    })

    // 6. Send welcome email (fire-and-forget)
    try {
      const { sendWelcomeEmail } = await import('@/lib/resend/emails/welcome')
      sendWelcomeEmail({
        preferredName: updatedUser.preferredName || 'there',
        companionName: 'Sam',
        email: updatedUser.email,
      }).catch(err => console.error('Welcome email failed:', err))
    } catch {
      // Resend not configured — skip silently
    }

    return NextResponse.json({
      success: true,
      profile: {
        preferredName: updatedUser.preferredName,
        targetScore: targetScoreNum,
        weakSections,
      },
    })
  } catch (error) {
    console.error('Onboarding API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
