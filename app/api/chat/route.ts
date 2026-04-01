import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { agentClient, getAgentModel } from '@/lib/openai/client'
import {
  routeToGmatAgent,
  GmatAgentType,
} from '@/agents/gmat/orchestrator'
import {
  buildQuantitativePrompt,
  buildVerbalPrompt,
  buildDataInsightsPrompt,
  buildStrategyPrompt,
  GmatLearnerProfile,
} from '@/agents/gmat'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { retrieveContext, formatContextForPrompt } from '@/lib/pinecone/retrieval'
import { getNamespaceForGmatAgent, getGmatSecondaryNamespace } from '@/lib/pinecone/namespace-mapping'
import { ChatResponse, ErrorResponse } from '@/types'

// Validate input
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().optional(),
  enableVoiceResponse: z.boolean().optional(),
})

/**
 * SamiWISE GMAT Chat API.
 * Routes messages through the GMAT orchestrator to specialist agents.
 * Retrieves RAG context from Pinecone and builds agent-specific prompts.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Validate input
    const body = await request.json()
    const validation = ChatRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid request', details: validation.error.message },
        { status: 400 }
      )
    }

    const { message: userMessage, sessionId, enableVoiceResponse } = validation.data

    // 3. Get or create user in DB
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || 'unknown@example.com',
          plan: 'free',
          companionName: 'Sam',
          language: 'en',
        },
      })
    }

    // 4. Rate limiting
    const rateLimitResult = await checkRateLimit(
      user.id,
      dbUser.plan as 'free' | 'pro' | 'premium',
      '/api/chat'
    )

    if (!rateLimitResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Rate limit exceeded',
          details: `Upgrade your plan for more sessions.`,
        },
        { status: 429 }
      )
    }

    // 5. Load learner profile
    const learnerProfile = (dbUser.gmatProfile as unknown as GmatLearnerProfile) || null

    // 6. Route message via GMAT orchestrator
    const routing = routeToGmatAgent(userMessage, learnerProfile ? {
      weakTopics: learnerProfile.weakTopics,
      strongTopics: learnerProfile.strongTopics,
      targetScore: learnerProfile.targetScore || undefined,
      learningStyle: learnerProfile.learningStyle || undefined,
    } : undefined)

    const agentType = routing.route

    // 7. Create or find GMAT session
    let session
    if (sessionId) {
      session = await prisma.gmatSession.findUnique({
        where: { id: sessionId },
      })
    }

    if (!session) {
      session = await prisma.gmatSession.create({
        data: {
          userId: user.id,
          agentUsed: agentType,
          topicsCovered: routing.detectedTopic ? [routing.detectedTopic] : [],
        },
      })
    }

    // 8. Save user message to Message table for transcript
    const userMessageRecord = await prisma.message.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        role: 'user',
        content: userMessage,
      },
    })

    // 9. Load recent messages for context
    const recentMessages = await prisma.message.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 30,
    })

    const messageHistory = recentMessages
      .slice(0, -1)
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))

    // 10. Load past session summaries
    const pastSessions = await prisma.gmatSession.findMany({
      where: {
        userId: user.id,
        id: { not: session.id },
        endedAt: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        agentUsed: true,
        topicsCovered: true,
        questionsAsked: true,
        correctAnswers: true,
        createdAt: true,
      },
    })

    const pastSessionsContext = pastSessions.length > 0
      ? pastSessions
          .reverse()
          .map(s => {
            const accuracy = s.questionsAsked > 0
              ? `${Math.round(s.correctAnswers / s.questionsAsked * 100)}%`
              : 'N/A'
            return `${s.agentUsed} session: ${s.topicsCovered.join(', ')} (accuracy: ${accuracy})`
          })
          .join('\n')
      : undefined

    // 11. RAG retrieval from Pinecone
    const namespace = getNamespaceForGmatAgent(agentType)
    const secondaryNs = getGmatSecondaryNamespace(agentType)

    const retrievedChunks = await retrieveContext(userMessage, namespace, 5, true, secondaryNs)
    const ragContext = formatContextForPrompt(retrievedChunks)

    // 12. Build agent-specific prompt
    const promptParams = {
      learnerProfile,
      pastSessions: pastSessionsContext,
      ragContext: ragContext || undefined,
      currentTopic: routing.detectedTopic,
      difficulty: routing.difficulty,
      sessionCount: pastSessions.length + 1,
    }

    let systemPrompt: string
    switch (agentType) {
      case 'quantitative':
        systemPrompt = buildQuantitativePrompt(promptParams)
        break
      case 'verbal':
        systemPrompt = buildVerbalPrompt(promptParams)
        break
      case 'data_insights':
        systemPrompt = buildDataInsightsPrompt(promptParams)
        break
      case 'strategy':
        systemPrompt = buildStrategyPrompt(promptParams)
        break
      default:
        systemPrompt = buildQuantitativePrompt(promptParams)
    }

    // 13. Call AI
    const completion = await agentClient.chat.completions.create({
      model: getAgentModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        ...messageHistory,
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const assistantMessage = completion.choices[0]?.message?.content ||
      "I had trouble generating a response. Could you try rephrasing?"

    // 14. Save assistant message
    const assistantMessageRecord = await prisma.message.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        role: 'assistant',
        content: assistantMessage,
      },
    })

    // 15. Generate voice response if requested
    let audioUrl: string | undefined

    if (enableVoiceResponse && dbUser.plan !== 'free') {
      try {
        const { textToSpeech } = await import('@/lib/elevenlabs/client')
        const audioBuffer = await textToSpeech(
          assistantMessage,
          dbUser.voiceId || undefined,
        )
        const base64Audio = Buffer.from(audioBuffer).toString('base64')
        audioUrl = `data:audio/mpeg;base64,${base64Audio}`
      } catch (error) {
        console.error('TTS generation failed:', error)
      }
    }

    // 16. Return response
    return NextResponse.json<ChatResponse>({
      message: assistantMessage,
      messageId: assistantMessageRecord.id,
      sessionId: session.id,
      audioUrl,
      sources: retrievedChunks.map(chunk => ({
        title: chunk.metadata.book_title,
        author: chunk.metadata.author,
        excerpt: chunk.text.slice(0, 200),
        score: chunk.score,
      })),
    })
  } catch (error) {
    console.error('GMAT Chat API error:', error)
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
