'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DodoCheckoutProps {
  productId: string
  planName: string
  children: React.ReactNode
  className?: string
  onSuccess?: () => void
}

export function DodoCheckout({
  productId,
  planName,
  children,
  className,
  onSuccess,
}: DodoCheckoutProps) {
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
        // Не авторизован — редирект на регистрацию с планом
        router.push(`/register?plan=${planName.toLowerCase()}`)
        return
      }

      if (res.status === 409) {
        // Уже подписан — редирект в настройки
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
        // Редирект на hosted checkout Dodo Payments
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
