// app/api/agents/sam-reflect/route.ts
// Prepwise — Sam's progress-anchor reflection after a practice session.
//
// The key difference from /api/weekly-review:
// - Called immediately after a session (not weekly)
// - Compares THIS session against the student's historical baseline
// - Names the specific delta: "three weeks ago X%, now Y%"
// - Uses agentClient (Claude/GPT-4o) directly — no Railway fallback chain

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { agentClient, getAgentModel } from '@/lib/openai/client'
import type { GmatLearnerProfile } from '@/agents/gmat/memory'

export const runtime = 'nodejs'

interface SessionResult {
  total: number
  correct: number
  accuracy: number
  avgTime: number
  byType: Record<string, { correct: number; total: number; accuracy: number }>
  errorTopics: string[]
}

const SYSTEM_PROMPT = `You are Sam, a direct and warm GMAT tutor. After each practice session, you give a brief reflection that:

1. Names what actually changed — compare TODAY to the baseline ("three weeks ago you were at 45% on DS, today 71% — that's not noise, that's a real shift")
2. Points out the ONE thing worth fixing next, with WHY it matters for the score
3. If the student is struggling — acknowledge it without sugar-coating, give a concrete micro-step

Rules:
- 2-4 sentences. No more.
- Never say "Great job!", "Keep it up!", "You're doing amazing!" — these are meaningless
- Never say "I" as the first word
- Reference specific numbers from the data
- If there's no historical delta to reference, focus on what the session data tells you
- Sound like a real tutor talking, not a progress report being read aloud`

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { sessionResult }: { sessionResult: SessionResult } = body

  if (!sessionResult || sessionResult.total === 0) {
    return NextResponse.json({ message: null })
  }

  try {
    // Load historical topic progress for comparison
    const [historicalProgress, recentSessions, dbUser] = await Promise.all([
      prisma.topicProgress.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'asc' },
      }),
      prisma.gmatSession.findMany({
        where: { userId: user.id },
        orderBy: { startedAt: 'desc' },
        take: 10,
        select: {
          startedAt: true,
          questionsAsked: true,
          correctAnswers: true,
          agentUsed: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { gmatProfile: true },
      }),
    ])

    const profile = (dbUser?.gmatProfile as unknown as GmatLearnerProfile) || null

    // Build historical baseline per section/type
    // Compare student's current accuracy against their earliest recorded accuracy
    const historicalBySection: Record<string, { early: number; current: number; topic: string }[]> = {}

    for (const tp of historicalProgress) {
      if (tp.totalAttempts < 5) continue // not enough data for comparison
      if (!historicalBySection[tp.section]) historicalBySection[tp.section] = []
      historicalBySection[tp.section].push({
        topic: tp.topic,
        early: 0, // we'll compute from session history below
        current: tp.accuracy,
      })
    }

    // Find session-level improvement: accuracy now vs 2+ weeks ago
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const earlyQ = recentSessions.filter(s => new Date(s.startedAt) < twoWeeksAgo)
    const recentQ = recentSessions.filter(s => new Date(s.startedAt) >= twoWeeksAgo)

    const earlyAcc = earlyQ.length > 0
      ? earlyQ.reduce((s, x) => s + (x.questionsAsked > 0 ? x.correctAnswers / x.questionsAsked : 0), 0) / earlyQ.length
      : null

    const recentAcc = recentQ.length > 0
      ? recentQ.reduce((s, x) => s + (x.questionsAsked > 0 ? x.correctAnswers / x.questionsAsked : 0), 0) / recentQ.length
      : null

    // Build the comparison context
    const contextLines: string[] = []

    // Current session stats
    contextLines.push(`## This session`)
    contextLines.push(`- ${sessionResult.total} questions, ${sessionResult.correct} correct (${Math.round(sessionResult.accuracy * 100)}% accuracy)`)
    contextLines.push(`- Average time: ${sessionResult.avgTime}s per question`)

    // Breakdown by type
    const types = Object.entries(sessionResult.byType)
    if (types.length > 0) {
      contextLines.push(`- By type: ${types.map(([t, s]) => `${t} ${Math.round(s.accuracy * 100)}%`).join(', ')}`)
    }

    if (sessionResult.errorTopics.length > 0) {
      contextLines.push(`- Struggled with: ${sessionResult.errorTopics.join(', ')}`)
    }

    // Historical comparison
    if (earlyAcc !== null && recentAcc !== null && earlyQ.length >= 2) {
      const earlyPct = Math.round(earlyAcc * 100)
      const recentPct = Math.round(recentAcc * 100)
      const delta = recentPct - earlyPct
      contextLines.push(``)
      contextLines.push(`## Historical comparison (last 2 weeks vs before)`)
      contextLines.push(`- Overall accuracy: ${earlyPct}% → ${recentPct}% (${delta >= 0 ? '+' : ''}${delta}pp)`)
    }

    // Topic-level progress from DB
    const improvedTopics = historicalProgress
      .filter(tp => tp.totalAttempts >= 5 && tp.accuracy >= 0.65)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 2)

    const weakTopics = historicalProgress
      .filter(tp => tp.totalAttempts >= 3 && tp.accuracy < 0.5)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 2)

    if (improvedTopics.length > 0) {
      contextLines.push(`- Strong topics (from history): ${improvedTopics.map(t => `${t.topic} ${Math.round(t.accuracy * 100)}%`).join(', ')}`)
    }

    if (weakTopics.length > 0) {
      contextLines.push(`- Persistent weak areas: ${weakTopics.map(t => `${t.topic} ${Math.round(t.accuracy * 100)}%`).join(', ')}`)
    }

    // Profile context
    if (profile?.commonErrorPatterns?.length) {
      contextLines.push(`- Recurring error patterns: ${profile.commonErrorPatterns.slice(0, 2).join(', ')}`)
    }

    if (profile?.targetScore) {
      contextLines.push(`- Target score: ${profile.targetScore}`)
    }

    if (profile?.currentEstimatedScore) {
      contextLines.push(`- Current estimated: ${profile.currentEstimatedScore}`)
    }

    const userContext = contextLines.join('\n')

    const completion = await agentClient.chat.completions.create({
      model: getAgentModel(),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContext },
      ],
      temperature: 0.75,
      max_tokens: 160,
    })

    const message = completion.choices[0]?.message?.content?.trim() || null

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Sam reflect error:', error)
    return NextResponse.json({ message: null })
  }
}
