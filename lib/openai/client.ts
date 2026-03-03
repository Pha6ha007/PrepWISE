import OpenAI from 'openai'

/**
 * Универсальный AI клиент для Groq или OpenAI
 *
 * Приоритет:
 * 1. Если есть GROQ_API_KEY → использует Groq (бесплатно для разработки)
 * 2. Если есть OPENAI_API_KEY → использует OpenAI
 *
 * Groq совместим с OpenAI SDK — меняется только baseURL
 */

const useGroq = !!process.env.GROQ_API_KEY
const apiKey = useGroq ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error(
    'Missing AI API key. Set either GROQ_API_KEY or OPENAI_API_KEY in .env.local'
  )
}

export const openai = new OpenAI({
  apiKey,
  baseURL: useGroq ? 'https://api.groq.com/openai/v1' : undefined,
})

/**
 * Получить название модели из env или использовать дефолтную
 */
export function getModel(): string {
  if (useGroq) {
    return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  }
  return 'gpt-4o' // OpenAI default
}

/**
 * Для логирования какой провайдер используется
 */
export function getProviderInfo() {
  return {
    provider: useGroq ? 'Groq' : 'OpenAI',
    model: getModel(),
    isGroq: useGroq,
  }
}
