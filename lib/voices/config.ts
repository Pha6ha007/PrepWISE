/**
 * Voice Configuration для Voice Design Quiz
 * Маппинг на реальные ElevenLabs voice IDs
 *
 * ВАЖНО: Эти голоса должны быть доступны в вашем ElevenLabs аккаунте
 */

export type VoiceGender = 'male' | 'female'
export type VoiceType = 'warm_mature' | 'calm_young'
export type VoiceAgeGroup = 'young' | 'middle' | 'mature'

export interface VoiceConfig {
  id: string // ElevenLabs voice ID
  label: string
  description: string
  gender: VoiceGender
  type: VoiceType
  ageGroup?: VoiceAgeGroup // Для новых голосов с возрастными группами
  previewText: string
}

// Конфигурация всех доступных голосов
export const VOICE_CONFIGS: Record<string, VoiceConfig> = {
  // Мужские голоса
  male_warm_mature: {
    id: '29vD33N1CtxCmqQRPOHJ', // Drew - спокойный мужской
    label: 'Warm & Mature',
    description: 'Reassuring, experienced, like talking to a trusted friend',
    gender: 'male',
    type: 'warm_mature',
    previewText:
      "Hi, I'm here to listen. Whatever you're going through, you don't have to face it alone.",
  },
  male_calm_young: {
    id: 'pNInz6obpgDQGcFmaJgB', // Adam - молодой мужской
    label: 'Calm & Gentle',
    description: 'Soft-spoken, understanding, creates a safe space',
    gender: 'male',
    type: 'calm_young',
    previewText:
      "Hey, it's good to have you here. Take your time, I'm listening.",
  },

  // Женские голоса
  female_warm_mature: {
    id: 'EXAVITQu4vr4xnSDxMaL', // Rachel - тёплый женский
    label: 'Warm & Compassionate',
    description: 'Nurturing, empathetic, feels like a caring presence',
    gender: 'female',
    type: 'warm_mature',
    previewText:
      "Hello, I'm so glad you're here. This is a safe place for you to share.",
  },
  female_calm_young: {
    id: 'jsCqWAovK2LkecY7zXl4', // Freya - мягкий молодой женский
    label: 'Soft & Gentle',
    description: 'Soothing, kind, brings a sense of calm',
    gender: 'female',
    type: 'calm_young',
    previewText:
      "Hi there. Whatever's on your mind, I'm here to listen without judgment.",
  },

  // ============================================
  // ВОЗРАСТНЫЕ ГОЛОСА (Age-Based Voices)
  // ============================================

  // Мужские голоса по возрасту
  male_young: {
    id: 'qT5tlOginLyKr5HuvpHS', // Male 25-30
    label: 'Young & Friendly',
    description: 'Energetic and warm, like a supportive older brother',
    gender: 'male',
    type: 'calm_young',
    ageGroup: 'young',
    previewText:
      "Hey, I'm here whenever you need to talk. There's no rush, no pressure. Just say what's on your mind, and we'll figure it out together.",
  },
  male_middle: {
    id: 'F6OwKwlw8jPcvYzhVBZO', // Male 35-40
    label: 'Calm & Grounded',
    description: 'Warm and trustworthy, with a steady presence',
    gender: 'male',
    type: 'warm_mature',
    ageGroup: 'middle',
    previewText:
      "Hey, I'm here whenever you need to talk. There's no rush, no pressure. Just say what's on your mind, and we'll figure it out together.",
  },
  male_mature: {
    id: 'd7C65bGlNr4QFXg9a0N2', // Male 45-55
    label: 'Wise & Steady',
    description: 'Deep and reassuring, brings a sense of stability',
    gender: 'male',
    type: 'warm_mature',
    ageGroup: 'mature',
    previewText:
      "Hey, I'm here whenever you need to talk. There's no rush, no pressure. Just say what's on your mind, and we'll figure it out together.",
  },

  // Женские голоса по возрасту
  female_young: {
    id: '97bmvlDqHLxB26ly7GGv', // Female 25-30
    label: 'Bright & Warm',
    description: 'Friendly and caring, like a compassionate best friend',
    gender: 'female',
    type: 'calm_young',
    ageGroup: 'young',
    previewText:
      "Hey, I'm here whenever you need to talk. There's no rush, no pressure. Just say what's on your mind, and we'll figure it out together.",
  },
  female_middle: {
    id: 'sQO8crlQi2Bf26ns9I47', // Female 35-40
    label: 'Soft & Soothing',
    description: 'Calm and nurturing, creates a safe space',
    gender: 'female',
    type: 'warm_mature',
    ageGroup: 'middle',
    previewText:
      "Hey, I'm here whenever you need to talk. There's no rush, no pressure. Just say what's on your mind, and we'll figure it out together.",
  },
  female_mature: {
    id: '6kVHgJVT8VFjoZTr4qV0', // Female 45-55
    label: 'Rich & Nurturing',
    description: 'Wise and gentle, brings comfort and understanding',
    gender: 'female',
    type: 'warm_mature',
    ageGroup: 'mature',
    previewText:
      "Hey, I'm here whenever you need to talk. There's no rush, no pressure. Just say what's on your mind, and we'll figure it out together.",
  },
}

// Дефолтные голоса для FREE плана
export const DEFAULT_VOICE_IDS = {
  male: '29vD33N1CtxCmqQRPOHJ', // Drew
  female: 'EXAVITQu4vr4xnSDxMaL', // Rachel
} as const

// Предложенные имена компаньонов
export const SUGGESTED_NAMES = {
  male: ['Alex', 'Sam', 'Jordan', 'Morgan'],
  female: ['Alex', 'Anna', 'Mia', 'Taylor'],
} as const

/**
 * Получить конфиг голоса по ключу
 */
export function getVoiceConfig(key: string): VoiceConfig | undefined {
  return VOICE_CONFIGS[key]
}

/**
 * Получить все голоса для определённого пола
 */
export function getVoicesForGender(gender: VoiceGender): VoiceConfig[] {
  return Object.values(VOICE_CONFIGS).filter((voice) => voice.gender === gender)
}

/**
 * Получить дефолтный voice ID для пола
 */
export function getDefaultVoiceId(gender: VoiceGender): string {
  return DEFAULT_VOICE_IDS[gender]
}

/**
 * Получить ключ голоса по voice ID
 */
export function getVoiceKeyById(voiceId: string): string | undefined {
  return Object.keys(VOICE_CONFIGS).find(
    (key) => VOICE_CONFIGS[key].id === voiceId
  )
}

/**
 * Получить голоса по полу и возрастной группе
 */
export function getVoicesByAge(gender: VoiceGender, ageGroup: VoiceAgeGroup): VoiceConfig[] {
  return Object.values(VOICE_CONFIGS).filter(
    (voice) => voice.gender === gender && voice.ageGroup === ageGroup
  )
}

/**
 * Получить все голоса с возрастными группами
 */
export function getAgeBasedVoices(): VoiceConfig[] {
  return Object.values(VOICE_CONFIGS).filter((voice) => voice.ageGroup !== undefined)
}
