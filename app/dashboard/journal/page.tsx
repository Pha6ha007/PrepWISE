import { StudyJournalClient } from '@/components/journal/StudyJournalClient'

export default async function JournalPage() {
  let entries: any[] = []
  let streakDays = 0

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { prisma } = await import('@/lib/prisma')

      // Fetch last 90 days of journal entries
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const dbEntries = await prisma.studyJournalEntry.findMany({
        where: {
          userId: user.id,
          date: { gte: ninetyDaysAgo },
        },
        orderBy: { date: 'desc' },
      })

      entries = dbEntries.map(e => ({
        id: e.id,
        date: e.date.toISOString().split('T')[0],
        totalMinutes: e.totalMinutes,
        sessionsCount: e.sessionsCount,
        questionsTotal: e.questionsTotal,
        questionsCorrect: e.questionsCorrect,
        accuracy: e.accuracy,
        topicsCovered: e.topicsCovered,
        sectionsWorked: e.sectionsWorked,
        errorsCount: e.errorsCount,
        errorTypes: e.errorTypes,
        samInsight: e.samInsight,
        milestones: e.milestones,
        userNote: e.userNote,
        confidenceLevel: e.confidenceLevel,
      }))

      // Calculate streak
      const sortedDates = entries.map(e => e.date).sort().reverse()
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        streakDays = 1
        for (let i = 1; i < sortedDates.length; i++) {
          const prev = new Date(sortedDates[i - 1])
          const curr = new Date(sortedDates[i])
          const diffDays = (prev.getTime() - curr.getTime()) / 86400000
          if (diffDays <= 1) streakDays++
          else break
        }
      }
    }
  } catch (error: any) {
    console.warn('Journal: Could not load —', error.message?.slice(0, 60))
  }

  return (
    <div className="min-h-full max-w-5xl mx-auto p-6 lg:p-8">
      <StudyJournalClient entries={entries} streakDays={streakDays} />
    </div>
  )
}
