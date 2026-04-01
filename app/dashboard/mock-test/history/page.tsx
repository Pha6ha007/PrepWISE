// app/dashboard/mock-test/history/page.tsx
// Mock Test History — score progression chart + per-test breakdown.

import MockTestHistoryClient from '@/components/mock-test/MockTestHistoryClient'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export default async function MockTestHistoryPage() {
  let tests: MockTestRecord[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const rows = await prisma.mockTest.findMany({
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

      tests = rows.map(r => ({
        ...r,
        takenAt: r.takenAt.toISOString(),
      }))
    }
  } catch (error: any) {
    console.warn('MockTestHistory: DB not available —', error.message?.slice(0, 80))
  }

  return (
    <div className="min-h-full max-w-5xl mx-auto p-6 lg:p-8">
      <MockTestHistoryClient tests={tests} />
    </div>
  )
}

export interface MockTestRecord {
  id: string
  takenAt: string
  durationMins: number
  totalScore: number | null
  quantScore: number | null
  verbalScore: number | null
  dataInsightsScore: number | null
  quantAccuracy: number | null
  verbalAccuracy: number | null
  diAccuracy: number | null
  notes: string | null
}
