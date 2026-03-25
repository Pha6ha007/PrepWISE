import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { routeToGmatAgent, GmatAgentType } from '@/agents/gmat/orchestrator'

/**
 * GMAT Agent Chat API
 * Routes messages to the appropriate specialist agent.
 * In production, this connects to the Railway-hosted agent backend.
 */
export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { message, agentType, sessionMessages } = body

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Route the message if no specific agent is set
    let targetAgent: GmatAgentType = agentType || 'quantitative'

    if (!agentType) {
      const routing = routeToGmatAgent(message)
      targetAgent = routing.route
    }

    // Check if Railway agent backend is configured
    const railwayUrl = process.env.RAILWAY_AGENT_URL

    if (railwayUrl) {
      // Forward to Railway-hosted agent backend
      const response = await fetch(`${railwayUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RAILWAY_AGENT_SECRET || ''}`,
        },
        body: JSON.stringify({
          userId: user.id,
          message,
          agentType: targetAgent,
          sessionMessages,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }

      console.error('Railway agent error:', response.status)
    }

    // Fallback: direct agent response (for development/when Railway isn't set up)
    // This uses the orchestrator routing but returns a placeholder response
    const routing = routeToGmatAgent(message)

    return NextResponse.json({
      message: getPlaceholderResponse(routing.route, message),
      agentType: routing.route,
      routing: {
        confidence: routing.confidence,
        reasoning: routing.reasoning,
        detectedTopic: routing.detectedTopic,
        difficulty: routing.difficulty,
        emotionalState: routing.emotionalState,
      },
    })
  } catch (error) {
    console.error('Agent chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

/**
 * Placeholder responses for when the agent backend isn't connected.
 * These demonstrate the routing is working correctly.
 */
function getPlaceholderResponse(agent: GmatAgentType, message: string): string {
  const responses: Record<GmatAgentType, string> = {
    quantitative:
      "Great question! I'd love to walk through this math problem with you. Let me break it down step by step. (Note: Full agent response requires the Railway backend to be connected.)",
    verbal:
      "Let's analyze this verbal question together. I'll help you identify the key logical structure. (Note: Full agent response requires the Railway backend to be connected.)",
    data_insights:
      "Interesting data problem! Before we calculate anything, let's first understand what the data is showing us. (Note: Full agent response requires the Railway backend to be connected.)",
    strategy:
      "Good question about strategy! Let me help you think through your study plan and approach. (Note: Full agent response requires the Railway backend to be connected.)",
  }
  return responses[agent]
}
