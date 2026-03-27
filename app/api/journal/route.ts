import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/journal — Get journal entries for a date range
 * Query params: from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * POST /api/journal — Add a user note or confidence level to today's entry
 * Body: { note?: string, confidenceLevel?: number }
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { prisma } = await import('@/lib/prisma')
    const { searchParams } = new URL(request.url)

    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: any = { userId: user.id }
    if (from) where.date = { ...where.date, gte: new Date(from) }
    if (to) where.date = { ...where.date, lte: new Date(to) }

    const entries = await prisma.studyJournalEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 90,
    })

    return NextResponse.json({
      entries: entries.map(e => ({
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
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await request.json()
    const { note, confidenceLevel } = body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Upsert today's entry (create if doesn't exist)
    const entry = await prisma.studyJournalEntry.upsert({
      where: {
        userId_date: { userId: user.id, date: today },
      },
      create: {
        userId: user.id,
        date: today,
        userNote: note || null,
        confidenceLevel: confidenceLevel || null,
      },
      update: {
        ...(note !== undefined && { userNote: note }),
        ...(confidenceLevel !== undefined && { confidenceLevel }),
      },
    })

    return NextResponse.json({ success: true, entry })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
