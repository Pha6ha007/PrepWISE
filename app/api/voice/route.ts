import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai/client'
import { ErrorResponse } from '@/types'

/**
 * POST /api/voice
 *
 * Транскрибирует аудио в текст через Whisper (Groq или OpenAI)
 *
 * Body: FormData с файлом audio
 *
 * ВСЕГДА:
 * - Auth check первым
 * - Валидация формата аудио
 * - Лимит размера файла
 */

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB (Whisper limit)
const ALLOWED_FORMATS = [
  'audio/webm',
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/mp4',
  'audio/m4a',
  'audio/ogg',
]

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
    // 2. ПОЛУЧИТЬ АУДИО ФАЙЛ ИЗ FORMDATA
    // ============================================
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return NextResponse.json<ErrorResponse>(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // ============================================
    // 3. ВАЛИДАЦИЯ ФАЙЛА
    // ============================================
    // Проверить размер
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'File too large',
          details: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      )
    }

    // Проверить формат
    if (!ALLOWED_FORMATS.includes(audioFile.type)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Invalid audio format',
          details: `Allowed formats: ${ALLOWED_FORMATS.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // ============================================
    // 4. ТРАНСКРИПЦИЯ ЧЕРЕЗ WHISPER
    // ============================================
    // Groq поддерживает Whisper API совместимый интерфейс
    // Модель: whisper-large-v3-turbo (быстрая и точная)
    const whisperModel = process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3-turbo'

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: whisperModel,
      language: 'en', // NOTE: можно добавить поддержку 'ru' через user.language
      response_format: 'json',
    })

    const transcribedText = transcription.text

    if (!transcribedText || transcribedText.trim().length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Transcription failed',
          details: 'Could not transcribe audio. Please try again.',
        },
        { status: 500 }
      )
    }

    // ============================================
    // 5. ВЕРНУТЬ ТРАНСКРИПЦИЮ
    // ============================================
    return NextResponse.json({
      text: transcribedText,
    })
  } catch (error) {
    console.error('Voice transcription error:', error)

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
