/**
 * ElevenLabs Text-to-Speech клиент
 *
 * Используется для генерации уникального голоса собеседника.
 *
 * ВАЖНО:
 * - Каждый пользователь может иметь уникальный voiceId
 * - По умолчанию используется Rachel (хороший тёплый женский голос)
 * - Starter план: 10,000 символов/месяц
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

// Default voices — используй пока пользователь не выбрал свой
const DEFAULT_VOICES = {
  female: 'EXAVITQu4vr4xnSDxMaL', // Rachel - warm, friendly female
  male: '29vD33N1CtxCmqQRPOHJ', // Drew - calm, supportive male
} as const

export interface ElevenLabsVoiceSettings {
  stability: number // 0-1, higher = more consistent
  similarity_boost: number // 0-1, higher = closer to original
  style?: number // 0-1, exaggeration
  use_speaker_boost?: boolean
}

// Default settings для психологического собеседника
const DEFAULT_SETTINGS: ElevenLabsVoiceSettings = {
  stability: 0.75, // Достаточно стабильный
  similarity_boost: 0.8, // Близко к оригиналу
  style: 0.3, // Немного выразительности
  use_speaker_boost: true,
}

/**
 * Генерация речи из текста
 */
export async function textToSpeech(
  text: string,
  voiceId?: string,
  gender?: 'male' | 'female'
): Promise<ArrayBuffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  // Определить voice ID
  const finalVoiceId = voiceId || DEFAULT_VOICES[gender || 'female']

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${finalVoiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5', // Fastest model — важно для UX
        voice_settings: DEFAULT_SETTINGS,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`)
  }

  return response.arrayBuffer()
}

/**
 * Получить список доступных голосов
 * Используется при онбординге для Voice Design Quiz
 */
export async function getAvailableVoices() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status}`)
  }

  return response.json()
}

/**
 * Получить информацию о конкретном голосе
 */
export async function getVoiceInfo(voiceId: string) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch voice info: ${response.status}`)
  }

  return response.json()
}

/**
 * Получить usage stats для отслеживания лимитов
 */
export async function getUsageStats() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch usage stats: ${response.status}`)
  }

  return response.json()
}
