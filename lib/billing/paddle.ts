// lib/billing/paddle.ts
// SamiWISE — Paddle billing client
// Paddle billing client

/**
 * Paddle product IDs for SamiWISE subscription plans.
 * Configure these in your Paddle Dashboard and set the env vars.
 */
export const PADDLE_PRODUCTS = {
  starter: process.env.PADDLE_PRODUCT_STARTER ?? '',
  pro: process.env.PADDLE_PRODUCT_PRO ?? '',
  intensive: process.env.PADDLE_PRODUCT_INTENSIVE ?? '',
} as const

export type PaddlePlan = 'starter' | 'pro' | 'intensive'

/**
 * Determine the plan name from a Paddle product/price ID
 */
export function getPlanFromProductId(productId: string): PaddlePlan | null {
  if (productId === PADDLE_PRODUCTS.starter) return 'starter'
  if (productId === PADDLE_PRODUCTS.pro) return 'pro'
  if (productId === PADDLE_PRODUCTS.intensive) return 'intensive'
  return null
}

/**
 * Paddle environment configuration
 */
export const PADDLE_ENVIRONMENT = (process.env.PADDLE_ENVIRONMENT || 'sandbox') as
  | 'sandbox'
  | 'production'

/**
 * Build Paddle checkout URL for a given plan.
 * Uses Paddle's overlay checkout pattern — no server-side subscription creation needed.
 */
export function getPaddleCheckoutSettings(plan: PaddlePlan) {
  const productId = PADDLE_PRODUCTS[plan]
  if (!productId) throw new Error(`Unknown plan: ${plan}`)

  return {
    productId,
    environment: PADDLE_ENVIRONMENT,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/session?upgraded=true`,
  }
}

/**
 * Plan details for display in the UI
 */
export const PLAN_DETAILS: Record<
  PaddlePlan,
  {
    name: string
    price: number
    period: string
    trialDays: number
    features: string[]
  }
> = {
  starter: {
    name: 'Starter',
    price: 39,
    period: 'month',
    trialDays: 7,
    features: [
      '20 voice sessions/month',
      'Quant + Verbal practice',
      'Progress tracking',
      'Session memory',
      '5,600+ practice questions',
    ],
  },
  pro: {
    name: 'Pro',
    price: 79,
    period: 'month',
    trialDays: 7,
    features: [
      'Unlimited voice sessions',
      'All 3 GMAT sections',
      'Adaptive mock tests',
      'Smart review (spaced repetition)',
      'Detailed analytics & error analysis',
      'Data Insights + DS coverage',
    ],
  },
  intensive: {
    name: 'Intensive',
    price: 149,
    period: 'month',
    trialDays: 7,
    features: [
      'Everything in Pro',
      'Personalized study plan',
      'Full mock tests with score reports',
      'Score prediction & percentile',
      'Priority support',
      'Audio explanations by Sam',
    ],
  },
}

/**
 * Verify Paddle webhook signature.
 * Paddle uses ts + h1 signature format.
 */
export async function verifyPaddleWebhook(
  rawBody: string,
  signature: string,
  webhookSecret: string
): Promise<boolean> {
  try {
    // Paddle signature format: ts=TIMESTAMP;h1=HASH
    const parts = signature.split(';')
    const tsStr = parts.find(p => p.startsWith('ts='))?.replace('ts=', '')
    const h1 = parts.find(p => p.startsWith('h1='))?.replace('h1=', '')

    if (!tsStr || !h1) return false

    // Build the signed payload: timestamp:rawBody
    const signedPayload = `${tsStr}:${rawBody}`

    const { createHmac } = await import('crypto')
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex')

    return h1 === expectedSignature
  } catch {
    return false
  }
}
