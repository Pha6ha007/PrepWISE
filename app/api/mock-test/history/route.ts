// app/api/mock-test/history/route.ts
// Returns all mock test results for the authenticated user, ordered by date.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const tests = await prisma.mockTest.findMany({
      where: { userId: user.id },
      orderBy: { takenAt: 'asc' },
      select: {
        id: true,
        takenAt: true,
        durationMins: true,
        totalScore: true,
        quantScore: true,
        verbalScore: true,
        dataInsightsScore: true,
        quantAccuracy: true,
        verbalAccuracy: true,
        diAccuracy: true,
        notes: true,
      },
    })

    return NextResponse.json({ tests })
  } catch (error) {
    console.error('Mock test history error:', error)
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 })
  }
}
