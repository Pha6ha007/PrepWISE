import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { textToSpeechStream } from '@/lib/elevenlabs/client'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/tts/stream
 *
 * Streaming TTS — accepts a sentence, returns streaming audio immediately.
 * Designed to be called multiple times as LLM generates sentences.
 * Lower latency than buffered TTS: first audio bytes arrive in ~300ms.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text } = await request.json()
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text' }, { status: 400 })
    }

    // Get user voice preference
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { voiceId: true, companionGender: true, plan: true },
    })

    if (dbUser?.plan === 'free') {
      return NextResponse.json({ error: 'Voice requires Pro plan' }, { status: 403 })
    }

    const gender = (dbUser?.companionGender === 'male' || dbUser?.companionGender === 'female')
      ? dbUser.companionGender : 'female'

    const audioStream = await textToSpeechStream(
      text,
      dbUser?.voiceId || undefined,
      gender as 'male' | 'female'
    )

    return new NextResponse(audioStream as any, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Streaming TTS error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'TTS failed' },
      { status: 500 }
    )
  }
}
