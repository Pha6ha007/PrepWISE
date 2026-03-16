/**
 * Crisis Detection Protocol
 *
 * КРИТИЧЕСКИ ВАЖНО:
 * - Этот модуль НЕ использует LLM
 * - Все проверки hardcoded
 * - Работает параллельно основному агенту
 * - При обнаружении кризиса НЕМЕДЛЕННО прерывает основной поток
 *
 * PsyGUARD Upgrade (март 2026):
 * - 4 уровня риска: none / ideation / planning / imminent
 * - Градуированные ответы по уровню тяжести
 * - Мягкий ответ на пассивные мысли, жёсткий на реальную опасность
 *
 * НИКОГДА не изменять без явного указания!
 */

import { CrisisResource, CrisisResponse, RiskLevel } from '@/types'
import { assessRisk, type RiskAssessment } from './risk-taxonomy'

// ── Crisis resources by language ───────────────────────────────

const CRISIS_RESOURCES: Record<string, CrisisResource[]> = {
  en: [
    {
      country: 'USA',
      name: '988 Suicide & Crisis Lifeline',
      phone: '988 (call or text)',
      description: '24/7 free and confidential support',
    },
    {
      country: 'USA',
      name: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: '24/7 text-based crisis support',
    },
    {
      country: 'UK',
      name: 'Samaritans',
      phone: '116 123',
      description: '24/7 listening service',
    },
    {
      country: 'Canada',
      name: 'Crisis Services Canada',
      phone: '1-833-456-4566 or text 45645',
      description: '24/7 support',
    },
    {
      country: 'Australia',
      name: 'Lifeline',
      phone: '13 11 14',
      description: '24/7 crisis support',
    },
    {
      country: 'International',
      name: 'Find A Helpline',
      phone: 'findahelpline.com',
      description: 'Directory of crisis lines worldwide',
    },
  ],

  ru: [
    {
      country: 'Россия',
      name: 'Телефон доверия',
      phone: '8-800-2000-122',
      description: 'Круглосуточно, бесплатно',
    },
    {
      country: 'Россия',
      name: 'Служба неотложной психологической помощи',
      phone: '051 (с мобильного)',
      description: 'Круглосуточно',
    },
    {
      country: 'International',
      name: 'Find A Helpline',
      phone: 'findahelpline.com',
      description: 'Международный справочник служб помощи',
    },
  ],
}

// ── Graduated hardcoded messages ───────────────────────────────
// NEVER generate these with LLM. They are safety-critical.

const GRADUATED_MESSAGES: Record<'ideation' | 'planning' | 'imminent', Record<string, string>> = {
  // Level 1: Passive ideation — warm, validating, gently suggests support
  ideation: {
    en: `I hear you. What you're feeling sounds really heavy, and I want you to know that matters.

Sometimes when everything feels overwhelming, those thoughts can show up — and that's a sign you need more support than I can offer alone.

Would you consider reaching out to someone who specializes in this?`,

    ru: `Слышу тебя. То, что ты чувствуешь, звучит очень тяжело — и мне важно, чтобы ты знал(а), что это имеет значение.

Иногда, когда всё становится невыносимым, такие мысли появляются — и это сигнал, что тебе нужна поддержка, которую я один не могу дать.

Готов(а) ли ты обратиться к тому, кто специализируется на этом?`,
  },

  // Level 2: Active planning — urgent, directive, resources prominent
  planning: {
    en: `I'm really concerned about what you've shared. This sounds serious, and I want to make sure you're safe.

Please reach out to a crisis counselor right now — they are trained professionals who can help:

🆘 988 Suicide & Crisis Lifeline — call or text 988
🆘 Crisis Text Line — text HOME to 741741

You don't have to carry this alone.`,

    ru: `Я очень обеспокоен тем, что ты сказал(а). Это звучит серьёзно, и я хочу убедиться, что ты в безопасности.

Пожалуйста, обратись к специалистам кризисной помощи прямо сейчас:

🆘 Телефон доверия: 8-800-2000-122 (бесплатно, 24/7)
🆘 Скорая психологическая помощь: 051

Ты не обязан(а) справляться с этим в одиночку.`,
  },

  // Level 3: Imminent danger — maximum urgency, emergency numbers, minimal text
  imminent: {
    en: `Your life matters. Please call for help right now:

🆘 988 Suicide & Crisis Lifeline — call 988
🆘 Emergency — call 911
🆘 Crisis Text Line — text HOME to 741741

If you've already taken action to harm yourself, call 911 immediately.

Someone is waiting to help you. Please reach out now.`,

    ru: `Твоя жизнь важна. Пожалуйста, позвони за помощью прямо сейчас:

🆘 Скорая помощь: 103
🆘 Телефон доверия: 8-800-2000-122
🆘 Экстренная помощь: 112

Если ты уже причинил(а) себе вред, вызови скорую помощь немедленно — 103.

Кто-то ждёт, чтобы помочь тебе. Пожалуйста, позвони сейчас.`,
  },
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Check message for crisis triggers using PsyGUARD risk taxonomy.
 *
 * @param message - User message text
 * @returns true if any risk level detected (ideation, planning, or imminent)
 */
export function detectCrisis(message: string): boolean {
  const assessment = assessRisk(message)
  return assessment.level !== 'none'
}

/**
 * Full risk assessment — returns level, confidence, and triggers.
 * Use this when you need the graduated response.
 *
 * @param message - User message text
 * @returns RiskAssessment from risk-taxonomy module
 */
export function assessCrisisRisk(message: string): RiskAssessment {
  return assessRisk(message)
}

/**
 * Get graduated crisis response based on risk level.
 *
 * @param level - Risk level from assessRisk()
 * @param language - User language (en | ru)
 * @returns Full crisis response with message and resources, or null if level is 'none'
 */
export function getCrisisResponse(
  level: RiskLevel | 'en' | 'ru' = 'en',
  language?: 'en' | 'ru'
): CrisisResponse {
  // Backwards compatibility: old callers pass language as first arg
  let resolvedLevel: RiskLevel
  let resolvedLang: 'en' | 'ru'

  if (level === 'en' || level === 'ru') {
    // Old API: getCrisisResponse('en') — default to 'imminent' for safety
    resolvedLevel = 'imminent'
    resolvedLang = level
  } else {
    resolvedLevel = level
    resolvedLang = language || 'en'
  }

  // Safety: if 'none' somehow gets here, treat as ideation
  if (resolvedLevel === 'none') {
    resolvedLevel = 'ideation'
  }

  return {
    isCrisis: true,
    level: resolvedLevel,
    message: GRADUATED_MESSAGES[resolvedLevel][resolvedLang],
    resources: CRISIS_RESOURCES[resolvedLang],
  }
}

/**
 * Log crisis event (WITHOUT message content!)
 *
 * @param userId - User ID
 * @param sessionId - Session ID
 * @param level - Risk level detected
 * @param category - Type of crisis (suicide, self_harm, violence)
 */
export async function logCrisisEvent(
  userId: string,
  sessionId: string,
  level?: RiskLevel,
  category?: string
) {
  // TODO: When monitoring is connected — send to PostHog
  console.warn('[CRISIS DETECTED]', {
    userId,
    sessionId,
    level: level || 'unknown',
    category: category || 'unknown',
    timestamp: new Date().toISOString(),
    // ВАЖНО: НЕ логировать содержание сообщения!
  })
}
