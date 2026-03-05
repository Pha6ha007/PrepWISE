// Confide Diary — Shared Service Layer
// Reusable diary generation logic for both manual API and cron jobs

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { generateDiaryPDF, DiaryData, DiarySession } from '@/lib/diary/generator';
import { generateMonthSummary } from '@/lib/diary/summary-generator';
import { sendMonthlyLetter } from '@/lib/email/send-monthly-letter';
import { format } from 'date-fns';

// ============================================
// TYPES
// ============================================

export interface GenerateDiaryResult {
  success: boolean;
  diaryId?: string;
  error?: string;
  emailSent?: boolean; // Whether monthly letter email was sent
  emailError?: string; // Email error (if any) - does NOT affect success
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

/**
 * Generate diary PDF for a user for a specific month
 * Can be used from both manual API and cron jobs
 */
export async function generateDiaryForUser(
  userId: string,
  month: number,
  year: number
): Promise<GenerateDiaryResult> {
  try {
    // Get user profile
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        companionName: true,
        email: true,
        profile: true, // Include user profile for AI summary
      },
    });

    if (!dbUser) {
      return { success: false, error: 'User not found' };
    }

    // Create or update diary entry with "generating" status
    const diary = await prisma.diary.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      create: {
        userId,
        month,
        year,
        title: `${format(new Date(year, month - 1), 'MMMM yyyy')} — Your Journey`,
        status: 'generating',
      },
      update: {
        status: 'generating',
        errorMessage: null,
      },
    });

    // Fetch sessions for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (sessions.length === 0) {
      await prisma.diary.update({
        where: { id: diary.id },
        data: {
          status: 'error',
          errorMessage: 'No sessions found for this month',
        },
      });
      return { success: false, error: 'No sessions found for this month' };
    }

    // Transform sessions into DiarySession format
    const diarySessions: DiarySession[] = sessions.map((session) => {
      // Get key dialogues (first 3 user-assistant pairs)
      const keyDialogues: DiarySession['keyDialogues'] = [];
      for (let i = 0; i < Math.min(6, session.messages.length); i++) {
        const msg = session.messages[i];
        keyDialogues.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content.slice(0, 200), // Truncate long messages
        });
      }

      return {
        date: session.createdAt,
        summary: session.summary || 'No summary available',
        keyDialogues,
        insight: extractInsightFromSession(session),
        moodScore: session.moodBefore || undefined,
      };
    });

    // Generate AI-powered month summary
    const monthSummary = await generateMonthSummary(
      sessions.map((s) => ({
        summary: s.summary || 'No summary available',
        moodScore: s.moodBefore || undefined,
        agentType: s.agentType,
        createdAt: s.createdAt,
      })),
      dbUser.companionName,
      dbUser.profile
        ? {
            communicationStyle: dbUser.profile.communicationStyle as Record<string, any>,
            emotionalProfile: dbUser.profile.emotionalProfile as any,
            lifeContext: dbUser.profile.lifeContext as any,
            patterns: dbUser.profile.patterns as string[],
            progress: dbUser.profile.progress as Record<string, any>,
            whatWorked: dbUser.profile.whatWorked as string[],
          }
        : undefined
    );

    // Generate PDF
    const diaryData: DiaryData = {
      userName: dbUser.email.split('@')[0], // Use email username for now
      companionName: dbUser.companionName,
      month,
      year,
      sessions: diarySessions,
      monthSummary,
    };

    const pdfBuffer = await generateDiaryPDF(diaryData);

    // Upload to Supabase Storage
    const fileName = `${userId}/${year}-${String(month).padStart(2, '0')}-diary.pdf`;
    const supabase = await createClient();

    const { error: uploadError } = await supabase.storage.from('diaries').upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('diaries').getPublicUrl(fileName);

    // Update diary with success
    await prisma.diary.update({
      where: { id: diary.id },
      data: {
        status: 'ready',
        storageUrl: publicUrlData.publicUrl,
      },
    });

    console.log(`[DIARY_GENERATED] ${diary.id} for user ${userId}`);

    // Send monthly letter email (non-blocking — diary success doesn't depend on email)
    const emailResult = await sendMonthlyLetter({
      userEmail: dbUser.email,
      userName: dbUser.email.split('@')[0], // Use email username for now
      companionName: dbUser.companionName,
      monthSummary,
      month,
      year,
      diaryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/journal`,
    });

    if (emailResult.success) {
      console.log(`[MONTHLY_LETTER_SENT] Email ID: ${emailResult.emailId} for user ${userId}`);
    } else {
      console.error(`[MONTHLY_LETTER_FAILED] ${emailResult.error} for user ${userId}`);
    }

    return {
      success: true,
      diaryId: diary.id,
      emailSent: emailResult.success,
      emailError: emailResult.error,
    };
  } catch (error) {
    console.error('[DIARY_GENERATION_ERROR]', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Try to update diary status (might fail if diary wasn't created)
    try {
      await prisma.diary.updateMany({
        where: {
          userId,
          month,
          year,
        },
        data: {
          status: 'error',
          errorMessage,
        },
      });
    } catch (updateError) {
      console.error('[DIARY_STATUS_UPDATE_ERROR]', updateError);
    }

    return { success: false, error: errorMessage };
  }
}

// ============================================
// HELPERS
// ============================================

function extractInsightFromSession(session: any): string | undefined {
  // Find journal entries linked to this session
  // For now, return undefined — can enhance later
  return undefined;
}
