// app/api/weekly-review/route.ts
// Prepwise — Sam's Weekly Progress Review
// Generates a personalized weekly review using the student's actual data.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { agentClient, getAgentModel } from '@/lib/openai/client'

export const runtime = 'nodejs'

const SAM_WEEKLY_REVIEW_PROMPT = `You are Sam, a direct and warm GMAT tutor doing a weekly review. Your job is to make the student feel SEEN — not praised generically, but specifically understood.

Rules:
- Name the actual delta if you have historical data: "Two weeks ago you were at X% on DS. Now you're at Y%. That moved."
- If accuracy went down, say so honestly: "This week was rougher than last — that happens. Here's what to reset."
- Name exactly ONE thing to fix next week and explain WHY that specific thing will move the score
- Give a realistic score range based on their current accuracy: "At this level you'd likely score 630-650. The gap to 700 is mostly RC timing."
- Never say "Great job!", "Keep it up!", "Amazing progress!" — these are hollow
- Never start with "I"
- Reference specific numbers from the data
- 150-200 words. Sound like a human tutor, not a dashboard report.`

const NO_DATA_NUDGE =
  "Hey, I haven't seen you this week. Even 20 minutes today would keep your momentum going. Pick one topic you've been putting off — just 10 practice questions. That's it. Your future self will thank you."

interface WeeklyStats {
  totalQuestions: number
  totalCorrect: number
  overallAccuracy: number
  sessionCount: number
  totalMinutes: number
  sectionAccuracy: Record<string, { correct: number; total: number; accuracy: number }>
  streakDays: number
  errorPatterns: Record<string, number>
  scoreTrend: { latest: number | null; previous: number | null; direction: string }
  topImprovedTopic: string | null
  weakestTopic: string | null
}

/**
 * GET /api/weekly-review
 *
 * Generates Sam's personalized weekly review based on the past 7 days of data.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Parallel queries for the past 7 days
    const [sessions, topicProgress, errorLogs, mockTests] = await Promise.all([
      prisma.gmatSession.findMany({
        where: { userId: user.id, startedAt: { gte: sevenDaysAgo } },
        orderBy: { startedAt: 'desc' },
      }),
      prisma.topicProgress.findMany({
        where: { userId: user.id, updatedAt: { gte: sevenDaysAgo } },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.errorLog.findMany({
        where: { userId: user.id, createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.mockTest.findMany({
        where: { userId: user.id, takenAt: { gte: sevenDaysAgo } },
        orderBy: { takenAt: 'desc' },
      }),
    ])

    // No data? Return the nudge directly — no LLM call needed
    const hasData = sessions.length > 0 || topicProgress.length > 0 || mockTests.length > 0
    if (!hasData) {
      return NextResponse.json({
        review: NO_DATA_NUDGE,
        hasData: false,
        generatedAt: new Date().toISOString(),
      })
    }

    // Load prior-week sessions for historical comparison
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const priorWeekSessions = await prisma.gmatSession.findMany({
      where: {
        userId: user.id,
        startedAt: { gte: twoWeeksAgo, lt: sevenDaysAgo },
      },
    })

    // Calculate stats
    const stats = calculateWeeklyStats(sessions, topicProgress, errorLogs, mockTests)

    // Build the data summary for the LLM
    const dataSummary = buildDataSummary(stats, priorWeekSessions)

    // Call LLM for Sam's review
    const completion = await agentClient.chat.completions.create({
      model: getAgentModel(),
      messages: [
        { role: 'system', content: SAM_WEEKLY_REVIEW_PROMPT },
        { role: 'user', content: dataSummary },
      ],
      temperature: 0.8,
      max_tokens: 400,
    })

    const reviewText = completion.choices[0]?.message?.content || NO_DATA_NUDGE

    return NextResponse.json({
      review: reviewText,
      hasData: true,
      stats: {
        totalQuestions: stats.totalQuestions,
        overallAccuracy: Math.round(stats.overallAccuracy * 100),
        sessionCount: stats.sessionCount,
        totalMinutes: stats.totalMinutes,
        streakDays: stats.streakDays,
      },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Weekly review error:', error)
    return NextResponse.json(
      { error: 'Failed to generate weekly review' },
      { status: 500 }
    )
  }
}

function calculateWeeklyStats(
  sessions: any[],
  topicProgress: any[],
  errorLogs: any[],
  mockTests: any[]
): WeeklyStats {
  // Questions & accuracy
  const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAsked, 0)
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0)
  const overallAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0

  // Session count & time
  const sessionCount = sessions.length
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMins || 0), 0)

  // Section accuracy from topic progress
  const sectionAccuracy: Record<string, { correct: number; total: number; accuracy: number }> = {}
  for (const tp of topicProgress) {
    if (!sectionAccuracy[tp.section]) {
      sectionAccuracy[tp.section] = { correct: 0, total: 0, accuracy: 0 }
    }
    sectionAccuracy[tp.section].correct += tp.correctAttempts
    sectionAccuracy[tp.section].total += tp.totalAttempts
  }
  for (const section of Object.keys(sectionAccuracy)) {
    const s = sectionAccuracy[section]
    s.accuracy = s.total > 0 ? s.correct / s.total : 0
  }

  // Streak: count unique study days
  const studyDays = new Set<string>()
  for (const s of sessions) {
    studyDays.add(new Date(s.startedAt).toISOString().split('T')[0])
  }
  const streakDays = studyDays.size

  // Error patterns
  const errorPatterns: Record<string, number> = {}
  for (const e of errorLogs) {
    const key = e.errorType
    errorPatterns[key] = (errorPatterns[key] || 0) + 1
  }

  // Score trend from mock tests
  const scoreTrend = {
    latest: mockTests[0]?.totalScore ?? null,
    previous: mockTests[1]?.totalScore ?? null,
    direction:
      mockTests.length >= 2 && mockTests[0]?.totalScore && mockTests[1]?.totalScore
        ? mockTests[0].totalScore > mockTests[1].totalScore
          ? 'up'
          : mockTests[0].totalScore < mockTests[1].totalScore
            ? 'down'
            : 'flat'
        : 'insufficient_data',
  }

  // Top improved topic (highest accuracy among topics with enough attempts)
  const topicsByAccuracy = topicProgress
    .filter((tp) => tp.totalAttempts >= 3)
    .sort((a, b) => b.accuracy - a.accuracy)
  const topImprovedTopic = topicsByAccuracy[0]?.topic ?? null

  // Weakest topic
  const weakestTopic = [...topicsByAccuracy].reverse()[0]?.topic ?? null

  return {
    totalQuestions,
    totalCorrect,
    overallAccuracy,
    sessionCount,
    totalMinutes,
    sectionAccuracy,
    streakDays,
    errorPatterns,
    scoreTrend,
    topImprovedTopic,
    weakestTopic,
  }
}

function buildDataSummary(stats: WeeklyStats, priorWeekSessions: any[] = []): string {
  const lines: string[] = [
    `## Student's Week in Numbers`,
    ``,
    `- Sessions: ${stats.sessionCount}`,
    `- Questions answered: ${stats.totalQuestions}`,
    `- Overall accuracy: ${Math.round(stats.overallAccuracy * 100)}%`,
    `- Time spent: ${stats.totalMinutes} minutes`,
    `- Study days this week: ${stats.streakDays}/7`,
  ]

  // Historical delta: prior week vs this week overall accuracy
  if (priorWeekSessions.length > 0) {
    const priorQ = priorWeekSessions.reduce((s, x) => s + x.questionsAsked, 0)
    const priorCorrect = priorWeekSessions.reduce((s, x) => s + x.correctAnswers, 0)
    const priorAcc = priorQ > 0 ? priorCorrect / priorQ : null
    if (priorAcc !== null) {
      const delta = Math.round((stats.overallAccuracy - priorAcc) * 100)
      lines.push(`- vs prior week: ${Math.round(priorAcc * 100)}% → ${Math.round(stats.overallAccuracy * 100)}% (${delta >= 0 ? '+' : ''}${delta}pp)`)
    }
  }

  // Section breakdown
  const sections = Object.entries(stats.sectionAccuracy)
  if (sections.length > 0) {
    lines.push(``, `### Accuracy by Section`)
    for (const [section, data] of sections) {
      lines.push(`- ${section}: ${Math.round(data.accuracy * 100)}% (${data.correct}/${data.total})`)
    }
  }

  // Error patterns
  const errors = Object.entries(stats.errorPatterns)
  if (errors.length > 0) {
    lines.push(``, `### Error Patterns`)
    for (const [type, count] of errors.sort((a, b) => b[1] - a[1])) {
      lines.push(`- ${type}: ${count} occurrences`)
    }
  }

  // Score trend
  if (stats.scoreTrend.latest !== null) {
    lines.push(``, `### Mock Test Scores`)
    lines.push(`- Latest score: ${stats.scoreTrend.latest}`)
    if (stats.scoreTrend.previous !== null) {
      lines.push(`- Previous score: ${stats.scoreTrend.previous}`)
      lines.push(`- Trend: ${stats.scoreTrend.direction}`)
    }
  }

  // Highlights
  if (stats.topImprovedTopic) {
    lines.push(``, `### Highlights`)
    lines.push(`- Strongest topic this week: ${stats.topImprovedTopic}`)
  }
  if (stats.weakestTopic) {
    lines.push(`- Weakest topic this week: ${stats.weakestTopic}`)
  }

  return lines.join('\n')
}
