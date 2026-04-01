// lib/gmat/journal-updater.ts
// SamiWISE — Auto-updates the daily study journal after each session.
// Called from the session end handler.

import { prisma } from '@/lib/prisma'

/**
 * Update (or create) today's journal entry with data from a completed session.
 * Called after each session ends.
 */
export async function updateDailyJournal(
  userId: string,
  sessionData: {
    durationMins: number
    questionsAsked: number
    correctAnswers: number
    agentUsed: string
    topicsCovered: string[]
    errors?: { type: string; count: number }[]
  }
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Map agent to section
  const sectionMap: Record<string, string> = {
    quantitative: 'quant',
    verbal: 'verbal',
    data_insights: 'data-insights',
    writing: 'awa',
    strategy: 'strategy',
  }
  const section = sectionMap[sessionData.agentUsed] || sessionData.agentUsed

  // Build error types object
  const errorTypes: Record<string, number> = {}
  if (sessionData.errors) {
    for (const e of sessionData.errors) {
      errorTypes[e.type] = (errorTypes[e.type] || 0) + e.count
    }
  }

  try {
    // Try to find existing entry for today
    const existing = await prisma.studyJournalEntry.findUnique({
      where: { userId_date: { userId, date: today } },
    })

    if (existing) {
      // Merge with existing entry
      const mergedTopics = [...new Set([...existing.topicsCovered, ...sessionData.topicsCovered])]
      const mergedSections = [...new Set([...existing.sectionsWorked, section])]
      const totalQ = existing.questionsTotal + sessionData.questionsAsked
      const totalCorrect = existing.questionsCorrect + sessionData.correctAnswers

      // Merge error types
      const existingErrors = (existing.errorTypes as Record<string, number>) || {}
      const mergedErrors = { ...existingErrors }
      for (const [type, count] of Object.entries(errorTypes)) {
        mergedErrors[type] = (mergedErrors[type] || 0) + count
      }

      await prisma.studyJournalEntry.update({
        where: { id: existing.id },
        data: {
          totalMinutes: existing.totalMinutes + sessionData.durationMins,
          sessionsCount: existing.sessionsCount + 1,
          questionsTotal: totalQ,
          questionsCorrect: totalCorrect,
          accuracy: totalQ > 0 ? totalCorrect / totalQ : 0,
          topicsCovered: mergedTopics,
          sectionsWorked: mergedSections,
          errorsCount: existing.errorsCount + Object.values(errorTypes).reduce((s, c) => s + c, 0),
          errorTypes: mergedErrors,
        },
      })
    } else {
      // Create new entry for today
      const totalQ = sessionData.questionsAsked
      const totalCorrect = sessionData.correctAnswers

      await prisma.studyJournalEntry.create({
        data: {
          userId,
          date: today,
          totalMinutes: sessionData.durationMins,
          sessionsCount: 1,
          questionsTotal: totalQ,
          questionsCorrect: totalCorrect,
          accuracy: totalQ > 0 ? totalCorrect / totalQ : 0,
          topicsCovered: sessionData.topicsCovered,
          sectionsWorked: [section],
          errorsCount: Object.values(errorTypes).reduce((s, c) => s + c, 0),
          errorTypes: errorTypes,
        },
      })
    }
  } catch (error) {
    console.error('Failed to update daily journal:', error)
  }
}

/**
 * Generate Sam's daily insight based on today's journal entry.
 * Called once per day (or after last session of the day).
 */
export async function generateDailyInsight(
  userId: string,
  date?: Date
): Promise<string | null> {
  const targetDate = date || new Date()
  targetDate.setHours(0, 0, 0, 0)

  try {
    const entry = await prisma.studyJournalEntry.findUnique({
      where: { userId_date: { userId, date: targetDate } },
    })

    if (!entry || entry.samInsight) return entry?.samInsight || null

    // Build insight based on entry data
    const insights: string[] = []

    // Accuracy trend
    if (entry.accuracy >= 0.8) {
      insights.push(`Strong day — ${(entry.accuracy * 100).toFixed(0)}% accuracy.`)
    } else if (entry.accuracy >= 0.6) {
      insights.push(`Solid practice. Room to improve accuracy from ${(entry.accuracy * 100).toFixed(0)}%.`)
    } else if (entry.accuracy > 0 && entry.questionsTotal >= 5) {
      insights.push(`Tough day at ${(entry.accuracy * 100).toFixed(0)}% accuracy. Let's review the concepts that tripped you up.`)
    }

    // Error patterns
    const errors = entry.errorTypes as Record<string, number>
    if (errors.careless && errors.careless >= 2) {
      insights.push('Watch for careless errors — double-check your work before confirming.')
    }
    if (errors.time_pressure && errors.time_pressure >= 2) {
      insights.push('Time pressure showing up. Practice the 2-minute rule on hard questions.')
    }
    if (errors.concept && errors.concept >= 2) {
      insights.push('Some concept gaps appeared. Worth revisiting the fundamentals.')
    }

    // Topic suggestion
    if (entry.sectionsWorked.length === 1) {
      const other = ['quant', 'verbal', 'data-insights'].find(s => !entry.sectionsWorked.includes(s))
      if (other) {
        insights.push(`You focused on ${entry.sectionsWorked[0]} today. Try mixing in ${other} tomorrow for balanced prep.`)
      }
    }

    // Study time
    if (entry.totalMinutes >= 60) {
      insights.push('Great study session today. Rest is important too — let your brain consolidate.')
    }

    const insight = insights.join(' ') || 'Good work today. Keep the momentum going.'

    // Save insight
    await prisma.studyJournalEntry.update({
      where: { id: entry.id },
      data: { samInsight: insight },
    })

    return insight
  } catch (error) {
    console.error('Failed to generate daily insight:', error)
    return null
  }
}

/**
 * Check and award milestones based on cumulative progress.
 */
export async function checkMilestones(userId: string): Promise<string[]> {
  const newMilestones: string[] = []

  try {
    // Count total questions across all entries
    const stats = await prisma.studyJournalEntry.aggregate({
      where: { userId },
      _sum: {
        questionsTotal: true,
        totalMinutes: true,
        sessionsCount: true,
      },
    })

    const totalQ = stats._sum.questionsTotal || 0
    const totalMin = stats._sum.totalMinutes || 0
    const totalSessions = stats._sum.sessionsCount || 0

    // Get today's entry
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const entry = await prisma.studyJournalEntry.findUnique({
      where: { userId_date: { userId, date: today } },
    })

    if (!entry) return []

    const existingMilestones = entry.milestones || []

    // Define milestones
    const milestoneChecks = [
      { key: 'first_session', check: totalSessions >= 1, label: 'First session completed!' },
      { key: 'q_50', check: totalQ >= 50, label: '50 questions answered' },
      { key: 'q_100', check: totalQ >= 100, label: '100 questions answered' },
      { key: 'q_500', check: totalQ >= 500, label: '500 questions — dedicated learner!' },
      { key: 'q_1000', check: totalQ >= 1000, label: '1,000 questions — GMAT warrior!' },
      { key: 'h_5', check: totalMin >= 300, label: '5 hours of study' },
      { key: 'h_10', check: totalMin >= 600, label: '10 hours of study' },
      { key: 'h_25', check: totalMin >= 1500, label: '25 hours — serious commitment' },
      { key: 'sessions_10', check: totalSessions >= 10, label: '10 sessions completed' },
      { key: 'sessions_25', check: totalSessions >= 25, label: '25 sessions — building a habit' },
    ]

    for (const m of milestoneChecks) {
      if (m.check && !existingMilestones.includes(m.label)) {
        newMilestones.push(m.label)
      }
    }

    // Save new milestones
    if (newMilestones.length > 0) {
      await prisma.studyJournalEntry.update({
        where: { id: entry.id },
        data: { milestones: [...existingMilestones, ...newMilestones] },
      })
    }
  } catch (error) {
    console.error('Failed to check milestones:', error)
  }

  return newMilestones
}
