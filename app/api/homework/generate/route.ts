/**
 * POST /api/homework/generate
 *
 * AI-generates homework based on session conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateHomework } from '@/lib/homework/generator'

const GenerateRequestSchema = z.object({
  sessionId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTH CHECK (always first!)
    // ============================================
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ============================================
    // 2. VALIDATE INPUT
    // ============================================
    const body = await request.json()
    const validation = GenerateRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.message },
        { status: 400 }
      )
    }

    const { sessionId } = validation.data

    // ============================================
    // 3. FETCH SESSION & VERIFY OWNERSHIP
    // ============================================
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        agentType: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify session belongs to user
    if (session.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ============================================
    // 4. FETCH LAST 15 MESSAGES
    // ============================================
    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        role: true,
        content: true,
      },
    })

    // Need at least 5 messages for context
    if (messages.length < 5) {
      return NextResponse.json(
        { error: 'Not enough conversation context. Need at least 5 messages.' },
        { status: 400 }
      )
    }

    // Reverse to chronological order
    messages.reverse()

    // ============================================
    // 5. FETCH USER PROFILE
    // ============================================
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    })

    const userProfile = dbUser?.profile
      ? {
          communicationStyle: dbUser.profile.communicationStyle,
          emotionalProfile: dbUser.profile.emotionalProfile,
          whatWorked: dbUser.profile.whatWorked,
        }
      : undefined

    // ============================================
    // 6. GENERATE HOMEWORK (AI)
    // ============================================
    const generated = await generateHomework(messages, userProfile)

    // ============================================
    // 7. CREATE HOMEWORK IN DATABASE
    // ============================================
    // Format agent name: "anxiety" -> "Anxiety"
    const agentName =
      session.agentType.charAt(0).toUpperCase() + session.agentType.slice(1)

    // Due date: 7 days from now
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)

    const homework = await prisma.homework.create({
      data: {
        userId: user.id,
        title: generated.title,
        description: generated.description,
        agent: agentName,
        dueDate,
        done: false,
      },
    })

    // ============================================
    // 8. RETURN CREATED HOMEWORK
    // ============================================
    return NextResponse.json(
      {
        homework,
        category: generated.category, // Return category for frontend (not stored in DB)
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Homework Generate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate homework' },
      { status: 500 }
    )
  }
}
