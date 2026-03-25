// app/api/agents/stream/route.ts
// Prepwise — Streaming GMAT Agent API
// Returns Server-Sent Events for real-time agent responses.

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { agentClient, getAgentModel } from '@/lib/openai/client'
import { routeToGmatAgent } from '@/agents/gmat/orchestrator'
import {
  buildQuantitativePrompt,
  buildVerbalPrompt,
  buildDataInsightsPrompt,
  buildStrategyPrompt,
  GmatLearnerProfile,
} from '@/agents/gmat'
import { retrieveContext, formatContextForPrompt } from '@/lib/pinecone/retrieval'
import { getNamespaceForGmatAgent, getGmatSecondaryNamespace } from '@/lib/pinecone/namespace-mapping'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const { message, sessionId, agentType: requestedAgent } = body

  if (!message) {
    return new Response(JSON.stringify({ error: 'Message required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Get user + profile
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const learnerProfile = (dbUser.gmatProfile as unknown as GmatLearnerProfile) || null

  // Route
  const routing = routeToGmatAgent(message, learnerProfile ? {
    weakTopics: learnerProfile.weakTopics,
    strongTopics: learnerProfile.strongTopics,
    targetScore: learnerProfile.targetScore || undefined,
  } : undefined)

  const agentType = requestedAgent || routing.route

  // RAG retrieval
  const namespace = getNamespaceForGmatAgent(agentType)
  const secondaryNs = getGmatSecondaryNamespace(agentType)
  const retrievedChunks = await retrieveContext(message, namespace, 5, true, secondaryNs)
  const ragContext = formatContextForPrompt(retrievedChunks)

  // Build prompt
  const promptParams = {
    learnerProfile,
    ragContext: ragContext || undefined,
    currentTopic: routing.detectedTopic,
    difficulty: routing.difficulty,
  }

  let systemPrompt: string
  switch (agentType) {
    case 'quantitative': systemPrompt = buildQuantitativePrompt(promptParams); break
    case 'verbal': systemPrompt = buildVerbalPrompt(promptParams); break
    case 'data_insights': systemPrompt = buildDataInsightsPrompt(promptParams); break
    case 'strategy': systemPrompt = buildStrategyPrompt(promptParams); break
    default: systemPrompt = buildQuantitativePrompt(promptParams)
  }

  // Load recent messages for context
  const recentMessages = sessionId
    ? await prisma.message.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: 20,
      })
    : []

  const messageHistory = recentMessages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }))

  // Stream response
  const stream = await agentClient.chat.completions.create({
    model: getAgentModel(),
    messages: [
      { role: 'system', content: systemPrompt },
      ...messageHistory,
      { role: 'user', content: message },
    ],
    temperature: 0.7,
    max_tokens: 500,
    stream: true,
  })

  // Convert to SSE
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      // Send routing info first
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ type: 'routing', agentType, confidence: routing.confidence, topic: routing.detectedTopic })}\n\n`
      ))

      let fullResponse = ''

      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            fullResponse += content
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: 'token', content })}\n\n`
            ))
          }
        }

        // Save assistant message to DB
        if (sessionId && fullResponse) {
          await prisma.message.create({
            data: {
              sessionId,
              userId: user.id,
              role: 'assistant',
              content: fullResponse,
            },
          })
        }

        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`
        ))
      } catch (error) {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`
        ))
      }

      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
