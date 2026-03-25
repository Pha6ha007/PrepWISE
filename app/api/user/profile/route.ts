import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const UpdateProfileSchema = z.object({
  preferredName: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .optional(),
  targetScore: z
    .number()
    .int()
    .min(205, 'Minimum GMAT score is 205')
    .max(805, 'Maximum GMAT score is 805')
    .nullable()
    .optional(),
  testDate: z
    .string()
    .refine(
      (val) => {
        if (!val) return true
        const date = new Date(val)
        return !isNaN(date.getTime()) && date > new Date()
      },
      { message: 'Test date must be a valid future date' }
    )
    .nullable()
    .optional(),
  studyHoursPerWeek: z
    .number()
    .int()
    .min(1, 'Minimum 1 hour per week')
    .max(40, 'Maximum 40 hours per week')
    .nullable()
    .optional(),
  weakSections: z
    .array(z.enum(['quant', 'verbal', 'data-insights']))
    .optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = UpdateProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { preferredName, targetScore, testDate, studyHoursPerWeek, weakSections } =
      validation.data

    // Fetch current user to merge gmatProfile fields
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { gmatProfile: true },
    })

    const currentProfile = (currentUser?.gmatProfile as Record<string, unknown>) || {}

    // Build updated gmatProfile — only override fields that were sent
    const updatedProfile: Record<string, unknown> = { ...currentProfile }

    if (targetScore !== undefined) {
      updatedProfile.targetScore = targetScore
    }
    if (testDate !== undefined) {
      updatedProfile.testDate = testDate
    }
    if (studyHoursPerWeek !== undefined) {
      updatedProfile.studyHoursPerWeek = studyHoursPerWeek
    }
    if (weakSections !== undefined) {
      updatedProfile.weakTopics = weakSections
    }

    // Build the update payload
    const updateData: Record<string, unknown> = {
      gmatProfile: updatedProfile,
    }

    if (preferredName !== undefined) {
      updateData.preferredName = preferredName
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        preferredName: true,
        email: true,
        gmatProfile: true,
        plan: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
