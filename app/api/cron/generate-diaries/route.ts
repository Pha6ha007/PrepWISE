// GET /api/cron/generate-diaries — Vercel Cron Job
// Automatically generates monthly diaries for all active users on the 1st of each month
// Schedule: "0 6 1 * *" (6:00 UTC on 1st of every month)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDiaryForUser } from '@/lib/diary/service';

export async function GET(req: NextRequest) {
  try {
    // Security: Verify CRON_SECRET to prevent unauthorized calls
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!authHeader || authHeader !== expectedAuth) {
      console.error('[CRON_UNAUTHORIZED] Invalid or missing CRON_SECRET');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current month and previous month (we generate for the previous month)
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Previous month
    const targetMonth = targetDate.getMonth() + 1; // 1-12
    const targetYear = targetDate.getFullYear();

    console.log(`[CRON_START] Generating diaries for ${targetYear}-${targetMonth}`);

    // Get all active users (users who have at least one session in the target month)
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const usersWithSessions = await prisma.session.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    const uniqueUserIds = [...new Set(usersWithSessions.map((s) => s.userId))];

    console.log(`[CRON_USERS] Found ${uniqueUserIds.length} users with sessions`);

    if (uniqueUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with sessions found',
        generated: 0,
        skipped: 0,
        errors: 0,
      });
    }

    // Generate diaries for all users
    const results = await Promise.allSettled(
      uniqueUserIds.map((userId) => generateDiaryForUser(userId, targetMonth, targetYear))
    );

    // Count results
    let generated = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: Array<{ userId: string; error: string }> = [];

    results.forEach((result, index) => {
      const userId = uniqueUserIds[index];

      if (result.status === 'fulfilled') {
        if (result.value.success) {
          generated++;
          console.log(`[CRON_SUCCESS] Generated diary for user ${userId}`);
        } else {
          if (result.value.error?.includes('No sessions found')) {
            skipped++;
          } else {
            errors++;
            errorDetails.push({ userId, error: result.value.error || 'Unknown error' });
            console.error(`[CRON_ERROR] Failed for user ${userId}:`, result.value.error);
          }
        }
      } else {
        errors++;
        errorDetails.push({ userId, error: result.reason?.message || 'Promise rejected' });
        console.error(`[CRON_ERROR] Promise rejected for user ${userId}:`, result.reason);
      }
    });

    console.log(`[CRON_COMPLETE] Generated: ${generated}, Skipped: ${skipped}, Errors: ${errors}`);

    return NextResponse.json({
      success: true,
      message: `Diary generation completed for ${targetYear}-${targetMonth}`,
      month: targetMonth,
      year: targetYear,
      totalUsers: uniqueUserIds.length,
      generated,
      skipped,
      errors,
      errorDetails: errors > 0 ? errorDetails : undefined,
    });
  } catch (error) {
    console.error('[CRON_FATAL_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
