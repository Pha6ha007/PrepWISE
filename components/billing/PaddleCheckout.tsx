'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PaddleCheckoutProps {
  productId: string
  planName: string
  children: React.ReactNode
  className?: string
  onSuccess?: () => void
}

/**
 * Paddle checkout button — creates a checkout session and redirects to Paddle's hosted checkout.
 * Paddle checkout button.
 */
export function PaddleCheckout({
  productId,
  planName,
  children,
  className,
  onSuccess,
}: PaddleCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })

      if (res.status === 401) {
        router.push(`/register?plan=${planName.toLowerCase()}`)
        return
      }

      if (res.status === 409) {
        router.push('/dashboard/settings')
        return
      }

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Something went wrong')
        return
      }

      const { checkoutUrl } = await res.json()

      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        setError('Could not create checkout session')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={loading} className={className}>
        {loading ? 'Loading...' : children}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}
