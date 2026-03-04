import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { textToSpeech } from '@/lib/elevenlabs/client'
import { getVoiceConfig } from '@/lib/voices/config'

/**
 * API endpoint для превью голосов во время онбординга
 *
 * POST /api/voice/preview
 * Body: { voiceKey: string, companionName?: string }
 *
 * ВАЖНО:
 * - Этот endpoint НЕ требует авторизации (используется в онбординге)
 * - Возвращает audio/mpeg для прослушивания
 * - Rate limiting должен быть включён (max 10 запросов в минуту с IP)
 */

const PreviewSchema = z.object({
  voiceKey: z.string().min(1),
  companionName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. ВАЛИДАЦИЯ
    // ============================================
    const body = await request.json()
    const validation = PreviewSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.message },
        { status: 400 }
      )
    }

    const { voiceKey, companionName } = validation.data

    // ============================================
    // 2. ПОЛУЧИТЬ КОНФИГ ГОЛОСА
    // ============================================
    const voiceConfig = getVoiceConfig(voiceKey)

    if (!voiceConfig) {
      return NextResponse.json(
        { error: 'Voice not found' },
        { status: 404 }
      )
    }

    // ============================================
    // 3. ПЕРСОНАЛИЗИРОВАТЬ ТЕКСТ ПРЕВЬЮ
    // ============================================
    let previewText = voiceConfig.previewText

    // Если указано имя компаньона, персонализируем текст
    if (companionName) {
      previewText = `Hi, I'm ${companionName}. ${previewText.split('. ').slice(1).join('. ')}`
    }

    // ============================================
    // 4. ГЕНЕРАЦИЯ АУДИО ЧЕРЕЗ ELEVENLABS
    // ============================================
    const audioBuffer = await textToSpeech(
      previewText,
      voiceConfig.id,
      voiceConfig.gender
    )

    // ============================================
    // 5. ВОЗВРАТ АУДИО
    // ============================================
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600', // Кэшировать на 1 час
      },
    })
  } catch (error) {
    console.error('Voice preview error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate voice preview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS для CORS (если нужно)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
