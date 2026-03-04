import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { textToSpeech } from '@/lib/elevenlabs/client'
import { ErrorResponse } from '@/types'

const prisma = new PrismaClient()

/**
 * POST /api/tts
 *
 * Генерирует аудио из текста через ElevenLabs
 *
 * Body: { text: string }
 *
 * ВСЕГДА:
 * - Auth check первым
 * - Plan check (голос только для Pro/Premium)
 * - Валидация длины текста
 * - Использует voiceId из профиля пользователя
 */

const TTSRequestSchema = z.object({
  text: z.string().min(1).max(5000),
})

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTH CHECK (всегда первым!)
    // ============================================
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ============================================
    // 2. ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ
    // ============================================
    const body = await request.json()
    const validation = TTSRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid request', details: validation.error.message },
        { status: 400 }
      )
    }

    const { text } = validation.data

    // ============================================
    // 3. ПОЛУЧИТЬ ПОЛЬЗОВАТЕЛЯ ИЗ БД
    // ============================================
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser) {
      return NextResponse.json<ErrorResponse>(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // ============================================
    // 4. PLAN CHECK (голос только для Pro/Premium)
    // ============================================
    if (dbUser.plan === 'free') {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Voice unavailable on free plan',
          details: 'Upgrade to Pro or Premium to use voice features',
        },
        { status: 403 }
      )
    }

    // ============================================
    // 5. ГЕНЕРАЦИЯ РЕЧИ ЧЕРЕЗ ELEVENLABS
    // ============================================
    // Используем voiceId из профиля или дефолтный по полу
    const audioBuffer = await textToSpeech(
      text,
      dbUser.voiceId || undefined,
      dbUser.companionGender || 'female'
    )

    // ============================================
    // 6. ВЕРНУТЬ АУДИО КАК STREAM
    // ============================================
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        // Cache для экономии запросов (тот же текст = тот же аудио)
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('TTS error:', error)

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
