// app/api/agents/session-start/route.ts
// SamiWISE — Sam's personalized session opening message.
// Called once when the user starts a voice/chat session.
// Uses the learner profile to generate a warm, specific greeting.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { agentClient } from '@/lib/openai/client'
import type { GmatLearnerProfile } from '@/agents/gmat/memory'

export const runtime = 'nodejs'

const DEFAULT_GREETING =
  "Hey, I'm Sam — your GMAT tutor. What would you like to work on today? We can tackle Quant, Verbal, Data Insights, or talk strategy. What's on your mind?"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ greeting: DEFAULT_GREETING })
  }

  try {
    // Load learner profile + recent session info
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { gmatProfile: true },
    })

    const profile = (dbUser?.gmatProfile as unknown as GmatLearnerProfile) || null

    // No profile yet → default greeting
    if (!profile || !profile.sessionTopics || profile.sessionTopics.length === 0) {
      return NextResponse.json({ greeting: DEFAULT_GREETING, isPersonalized: false })
    }

    // Get last session info
    const lastSession = await prisma.gmatSession.findFirst({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
    })

    const daysSinceLast = lastSession
      ? Math.floor(
          (Date.now() - new Date(lastSession.startedAt).getTime()) / (1000 * 60 * 60 * 24),
        )
      : null

    // Count study days this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const recentSessions = await prisma.gmatSession.findMany({
      where: { userId: user.id, startedAt: { gte: oneWeekAgo } },
      select: { startedAt: true },
    })
    const studyDaysThisWeek = new Set(
      recentSessions.map((s) => new Date(s.startedAt).toISOString().split('T')[0]),
    ).size

    // Build context for Sam
    const lastTopic =
      profile.sessionTopics.length > 0
        ? profile.sessionTopics[profile.sessionTopics.length - 1]
        : null
    const weakTopics = profile.weakTopics?.slice(0, 2).join(', ') || null
    const nextPlan = profile.nextSessionPlan

    const contextLines: string[] = []
    if (daysSinceLast !== null) {
      contextLines.push(
        daysSinceLast === 0
          ? `Student had a session earlier today`
          : daysSinceLast === 1
            ? `Student was here yesterday`
            : `Student's last session was ${daysSinceLast} days ago`,
      )
    }
    if (studyDaysThisWeek >= 3)
      contextLines.push(`Student has studied ${studyDaysThisWeek} days this week — good consistency`)
    if (lastTopic) contextLines.push(`Last topic worked on: ${lastTopic}`)
    if (weakTopics) contextLines.push(`Known weak areas: ${weakTopics}`)
    if (nextPlan) contextLines.push(`Recommended focus for this session: ${nextPlan}`)
    if (profile.targetScore)
      contextLines.push(`Target score: ${profile.targetScore}`)
    if (profile.currentEstimatedScore)
      contextLines.push(`Current estimated score: ${profile.currentEstimatedScore}`)
    if (profile.testDate) {
      const daysToTest = Math.floor(
        (new Date(profile.testDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
      if (daysToTest > 0 && daysToTest <= 60)
        contextLines.push(`Test date in ${daysToTest} days`)
    }

    const systemPrompt = `You are Sam, a warm and direct GMAT tutor. 
Write ONE opening message to greet the student at the start of their session. 
Be specific, reference what you know about them, and naturally suggest where to start.
Keep it 2-3 sentences. Sound like a real tutor, not a chatbot.
Do NOT say "Great to see you!" or generic filler. Be direct and warm.`

    const userContext = `Student context:\n${contextLines.join('\n')}`

    const completion = await agentClient.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContext },
      ],
      temperature: 0.85,
      max_tokens: 120,
    })

    const greeting =
      completion.choices[0]?.message?.content?.trim() || DEFAULT_GREETING

    return NextResponse.json({ greeting, isPersonalized: true })
  } catch (error) {
    console.error('Session start error:', error)
    return NextResponse.json({ greeting: DEFAULT_GREETING, isPersonalized: false })
  }
}
