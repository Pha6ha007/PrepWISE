import { GmatProgressClient } from '@/components/progress/GmatProgressClient'

/**
 * GMAT Progress Dashboard.
 * Tries to load data from Supabase. Falls back to empty state if DB not connected.
 */
export default async function GmatProgressPage() {
  let progressData = getEmptyProgressData()

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { prisma } = await import('@/lib/prisma')

      const [sessions, topicProgress, errorLogs, mockTests, dbUser] = await Promise.all([
        prisma.gmatSession.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.topicProgress.findMany({
          where: { userId: user.id },
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.errorLog.findMany({
          where: {
            userId: user.id,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        }),
        prisma.mockTest.findMany({
          where: { userId: user.id },
          orderBy: { takenAt: 'desc' },
          take: 20,
        }),
        prisma.user.findUnique({
          where: { id: user.id },
          select: { gmatProfile: true },
        }),
      ])

      const totalSessions = sessions.length
      const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMins || 0), 0)
      const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAsked, 0)
      const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0)

      const sectionStats = topicProgress.reduce(
        (acc, tp) => {
          if (!acc[tp.section]) acc[tp.section] = { totalAttempts: 0, correctAttempts: 0, topics: 0 }
          acc[tp.section].totalAttempts += tp.totalAttempts
          acc[tp.section].correctAttempts += tp.correctAttempts
          acc[tp.section].topics++
          return acc
        },
        {} as Record<string, { totalAttempts: number; correctAttempts: number; topics: number }>
      )

      const errorTypeBreakdown = errorLogs.reduce(
        (acc, log) => { acc[log.errorType] = (acc[log.errorType] || 0) + 1; return acc },
        {} as Record<string, number>
      )

      progressData = {
        summary: {
          totalSessions,
          totalMinutes,
          totalQuestions,
          totalCorrect,
          overallAccuracy: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
        },
        sectionStats,
        errorTypeBreakdown,
        topicProgress: topicProgress.map(tp => ({
          id: tp.id, section: tp.section, topic: tp.topic, subtopic: tp.subtopic,
          totalAttempts: tp.totalAttempts, correctAttempts: tp.correctAttempts,
          accuracy: tp.accuracy, masteryLevel: tp.masteryLevel,
          lastPracticed: tp.lastPracticed?.toISOString() || null,
        })),
        sessions: sessions.map(s => ({
          id: s.id, agentUsed: s.agentUsed, topicsCovered: s.topicsCovered,
          questionsAsked: s.questionsAsked, correctAnswers: s.correctAnswers,
          durationMins: s.durationMins, createdAt: s.createdAt.toISOString(),
        })),
        mockTests: mockTests.map(mt => ({
          id: mt.id, takenAt: mt.takenAt.toISOString(), durationMins: mt.durationMins,
          totalScore: mt.totalScore, quantScore: mt.quantScore,
          verbalScore: mt.verbalScore, dataInsightsScore: mt.dataInsightsScore,
        })),
        learnerProfile: (dbUser?.gmatProfile as any) || null,
      }
    }
  } catch (error: any) {
    // Supabase/DB not configured — show empty state
    console.warn('Progress: Could not load data —', error.message?.slice(0, 80))
  }

  return (
    <div className="min-h-full max-w-7xl mx-auto p-6 lg:p-8">
      <GmatProgressClient data={progressData} />
    </div>
  )
}

function getEmptyProgressData() {
  return {
    summary: { totalSessions: 0, totalMinutes: 0, totalQuestions: 0, totalCorrect: 0, overallAccuracy: 0 },
    sectionStats: {} as Record<string, { totalAttempts: number; correctAttempts: number; topics: number }>,
    errorTypeBreakdown: {} as Record<string, number>,
    topicProgress: [] as any[],
    sessions: [] as any[],
    mockTests: [] as any[],
    learnerProfile: null,
  }
}
