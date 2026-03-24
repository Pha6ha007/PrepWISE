'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

/**
 * Монтируется в dashboard layout.
 * Если в URL есть ?checkout=pro или ?checkout=premium —
 * автоматически создаёт Dodo Payments checkout и редиректит.
 */
export function AutoCheckout() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const plan = searchParams.get('checkout') // 'pro' | 'premium'
  const hasTriggered = useRef(false)

  useEffect(() => {
    if (!plan || hasTriggered.current) return

    const productId =
      plan === 'pro'
        ? process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO_ID
        : plan === 'premium'
          ? process.env.NEXT_PUBLIC_DODO_PRODUCT_PREMIUM_ID
          : null

    if (!productId) return

    hasTriggered.current = true

    const openCheckout = async () => {
      try {
        const res = await fetch('/api/billing/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (!res.ok) return

        const { checkoutUrl } = await res.json()
        if (checkoutUrl) {
          window.location.href = checkoutUrl
          return
        }
      } catch {
        // Тихо игнорируем — пользователь может вручную перейти в settings
      } finally {
        // Убираем ?checkout из URL в любом случае
        router.replace(pathname)
      }
    }

    openCheckout()
  }, [plan, pathname, router])

  return null
}
