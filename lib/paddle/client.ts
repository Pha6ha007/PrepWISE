import { Paddle, Environment } from '@paddle/paddle-node-sdk'

if (!process.env.PADDLE_API_KEY) {
  throw new Error('PADDLE_API_KEY is not set')
}

export const paddle = new Paddle(process.env.PADDLE_API_KEY, {
  environment:
    process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox'
      ? Environment.sandbox
      : Environment.production,
})

// Price IDs — читаем из env, не хардкодим
export const PADDLE_PRICES = {
  pro: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID!,
  premium: process.env.NEXT_PUBLIC_PADDLE_PREMIUM_PRICE_ID!,
} as const

// Определяем план по priceId
export function getPlanFromPriceId(priceId: string): 'pro' | 'premium' | null {
  if (priceId === PADDLE_PRICES.pro) return 'pro'
  if (priceId === PADDLE_PRICES.premium) return 'premium'
  return null
}
