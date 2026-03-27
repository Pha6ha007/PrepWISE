// app/api/pre-exam-coaching/route.ts
// Prepwise — Sam's AI-generated pre-exam coaching message.
// Called when pre-exam mode is active (7 days before test).
// Returns a personalized Sam message for TODAY based on actual stats.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { agentClient } from '@/lib/openai/client'
import { daysUntilExam } from '@/lib/gmat/pre-exam'
import type { GmatLearnerProfile } from '@/agents/gmat/memory'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { gmatProfile: true },
    })

    const profile = (dbUser?.gmatProfile as unknown as GmatLearnerProfile) || null

    if (!profile?.testDate) {
      return NextResponse.json({ message: null })
    }

    const days = daysUntilExam(profile.testDate)
    if (days < 1 || days > 7) {
      return NextResponse.json({ message: null })
    }

    // Load recent week stats for context
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [sessions, mockTests, topicProgress] = await Promise.all([
      prisma.gmatSession.findMany({
        where: { userId: user.id, startedAt: { gte: oneWeekAgo } },
        orderBy: { startedAt: 'desc' },
      }),
      prisma.mockTest.findMany({
        where: { userId: user.id },
        orderBy: { takenAt: 'desc' },
        take: 3,
      }),
      prisma.topicProgress.findMany({
        where: { userId: user.id },
        orderBy: { accuracy: 'asc' },
        take: 5,
      }),
    ])

    const totalQ = sessions.reduce((s, x) => s + x.questionsAsked, 0)
    const totalCorrect = sessions.reduce((s, x) => s + x.correctAnswers, 0)
    const weekAccuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : null
    const latestMock = mockTests[0]?.totalScore ?? null
    const weakTopics = (profile.weakTopics || []).slice(0, 3).join(', ')
    const strongTopics = (profile.strongTopics || []).slice(0, 2).join(', ')

    const dayLabel =
      days === 1
        ? 'the day before the exam'
        : days === 7
          ? 'the first day of their final week'
          : `${days} days before their exam`

    const systemPrompt = `You are Sam, a GMAT tutor whose student takes their exam in ${days} days.
Write ONE coaching message for today (${dayLabel}).
Be specific, reference their actual data, and focus them on the right thing for this specific day.
Keep it 2-4 sentences. Direct, calm, specific. Not "you can do it!" cheerleading — actual tactical advice.`

    const contextLines = [
      `Days until exam: ${days}`,
      weekAccuracy !== null ? `Week accuracy: ${weekAccuracy}%` : null,
      latestMock ? `Latest mock score: ${latestMock}` : null,
      profile.targetScore ? `Target score: ${profile.targetScore}` : null,
      weakTopics ? `Weak areas: ${weakTopics}` : null,
      strongTopics ? `Strong areas: ${strongTopics}` : null,
      profile.commonErrorPatterns?.length
        ? `Recurring error patterns: ${profile.commonErrorPatterns.slice(0, 2).join(', ')}`
        : null,
    ]
      .filter(Boolean)
      .join('\n')

    const completion = await agentClient.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contextLines },
      ],
      temperature: 0.75,
      max_tokens: 150,
    })

    const message = completion.choices[0]?.message?.content?.trim() || null

    return NextResponse.json({ message, days })
  } catch (error) {
    console.error('Pre-exam coaching error:', error)
    return NextResponse.json({ message: null })
  }
}
