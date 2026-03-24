import DodoPayments from 'dodopayments'

const isTestMode = process.env.DODO_PAYMENTS_ENVIRONMENT === 'test_mode'

// Lazy init — не кидаем ошибку при build time, только при runtime
let _dodo: DodoPayments | null = null

export function getDodo(): DodoPayments {
  if (!_dodo) {
    if (!process.env.DODO_PAYMENTS_API_KEY) {
      throw new Error('DODO_PAYMENTS_API_KEY is not set')
    }
    _dodo = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      ...(isTestMode && { environment: 'test_mode' }),
    })
  }
  return _dodo
}

// Обратная совместимость — для мест где используется `dodo` напрямую
// Используй getDodo() в новом коде
export const dodo = new Proxy({} as DodoPayments, {
  get(_target, prop) {
    return (getDodo() as any)[prop]
  },
})

// Product IDs — читаем из env, не хардкодим
export const DODO_PRODUCTS = {
  pro: process.env.DODO_PRODUCT_PRO_ID ?? '',
  premium: process.env.DODO_PRODUCT_PREMIUM_ID ?? '',
} as const

// Определяем план по productId
export function getPlanFromProductId(productId: string): 'pro' | 'premium' | null {
  if (productId === DODO_PRODUCTS.pro) return 'pro'
  if (productId === DODO_PRODUCTS.premium) return 'premium'
  return null
}
