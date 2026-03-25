import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { agentClient, getAgentModel } from '@/lib/openai/client'
import {
  buildGmatMemoryPrompt,
  mergeGmatProfile,
  GmatLearnerProfile,
} from '@/agents/gmat/memory'
import { ErrorResponse } from '@/types'

// Validate input
const MemoryRequestSchema = z.object({
  sessionId: z.string(),
})

/**
 * GMAT Memory Agent API route.
 * Called after each tutoring session to extract learning patterns
 * and update the learner profile.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Validate input
    const body = await request.json()
    const validation = MemoryRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid request', details: validation.error.message },
        { status: 400 }
      )
    }

    const { sessionId } = validation.data

    // 3. Find the GMAT session
    const session = await prisma.gmatSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
      },
    })

    if (!session) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.userId !== user.id) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 4. Check if already processed
    if (session.memoryUpdated) {
      return NextResponse.json({
        message: 'Session already processed',
      })
    }

    // 5. Get transcript
    const transcript = session.transcript
    if (!transcript || transcript.length < 50) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Not enough content to analyze' },
        { status: 400 }
      )
    }

    // 6. Load existing learner profile
    const existingProfile = (session.user.gmatProfile as unknown as GmatLearnerProfile) || null

    // 7. Call Memory Agent (LLM)
    const memoryPrompt = buildGmatMemoryPrompt(transcript, existingProfile)

    const memoryCompletion = await agentClient.chat.completions.create({
      model: getAgentModel(),
      messages: [{ role: 'user', content: memoryPrompt }],
      temperature: 0.3,
      max_tokens: 1500,
    })

    const memoryResponse = memoryCompletion.choices[0]?.message?.content
    if (!memoryResponse) {
      throw new Error('Memory Agent returned empty response')
    }

    // 8. Parse JSON response
    let extraction
    try {
      const cleanJson = memoryResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      extraction = JSON.parse(cleanJson)
    } catch {
      console.error('Failed to parse Memory Agent response:', memoryResponse)
      throw new Error('Memory Agent returned invalid JSON')
    }

    // 9. Merge with existing profile
    const updatedProfile = mergeGmatProfile(extraction, existingProfile)

    // 10. Save updated profile to User.gmatProfile
    await prisma.user.update({
      where: { id: user.id },
      data: {
        gmatProfile: updatedProfile as any,
      },
    })

    // 11. Mark session as processed
    await prisma.gmatSession.update({
      where: { id: sessionId },
      data: { memoryUpdated: true },
    })

    // 12. Return result
    return NextResponse.json({
      success: true,
      extraction,
      profileUpdated: true,
    })
  } catch (error) {
    console.error('GMAT Memory API error:', error)

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
