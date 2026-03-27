'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

/**
 * Mounted in dashboard layout.
 * If URL has ?checkout=starter|pro|intensive —
 * automatically creates Paddle checkout and redirects.
 */
export function AutoCheckout() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const plan = searchParams.get('checkout') // 'starter' | 'pro' | 'intensive'
  const hasTriggered = useRef(false)

  useEffect(() => {
    if (!plan || hasTriggered.current) return

    const productId =
      plan === 'starter'
        ? process.env.NEXT_PUBLIC_PADDLE_PRODUCT_STARTER
        : plan === 'pro'
          ? process.env.NEXT_PUBLIC_PADDLE_PRODUCT_PRO
          : plan === 'intensive'
            ? process.env.NEXT_PUBLIC_PADDLE_PRODUCT_INTENSIVE
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
        // Silently ignore — user can manually go to settings
      } finally {
        router.replace(pathname)
      }
    }

    openCheckout()
  }, [plan, pathname, router])

  return null
}
