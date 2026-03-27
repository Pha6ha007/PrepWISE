// app/api/mock-test/save/route.ts
// Save mock test result to DB after completion.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      totalScore, quantScore, verbalScore, dataInsightsScore,
      quantAccuracy, verbalAccuracy, diAccuracy, durationMins, notes,
    } = body

    const result = await prisma.mockTest.create({
      data: {
        userId: user.id,
        totalScore: totalScore ?? null,
        quantScore: quantScore ?? null,
        verbalScore: verbalScore ?? null,
        dataInsightsScore: dataInsightsScore ?? null,
        quantAccuracy: quantAccuracy ?? null,
        verbalAccuracy: verbalAccuracy ?? null,
        diAccuracy: diAccuracy ?? null,
        durationMins: durationMins ?? 135,
        notes: notes ?? null,
      },
    })

    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Save mock test error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
