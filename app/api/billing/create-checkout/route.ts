import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { PADDLE_PRODUCTS, PADDLE_ENVIRONMENT } from '@/lib/billing/paddle'

const RequestSchema = z.object({
  productId: z.string().min(1),
})

/**
 * Creates a Paddle checkout session and returns the checkout URL.
 * Paddle checkout creation.
 */
export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Validate input
  const body = await request.json()
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { productId } = parsed.data

  // 3. Verify that productId is a valid Paddle product
  const validProductIds = [
    PADDLE_PRODUCTS.starter,
    PADDLE_PRODUCTS.pro,
    PADDLE_PRODUCTS.intensive,
  ]
  if (!validProductIds.includes(productId)) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
  }

  // 4. Get user data from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, plan: true },
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // 5. Check if user already has an active subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  })

  if (subscription?.status === 'active') {
    return NextResponse.json(
      { error: 'Already subscribed. Manage your subscription in settings.' },
      { status: 409 }
    )
  }

  // 6. Build Paddle checkout URL
  // Paddle uses client-side overlay checkout or hosted checkout URLs.
  // For server-side, we build the transaction via Paddle API.
  try {
    const paddleApiKey = process.env.PADDLE_API_KEY
    if (!paddleApiKey) {
      throw new Error('PADDLE_API_KEY is not configured')
    }

    const baseUrl =
      PADDLE_ENVIRONMENT === 'production'
        ? 'https://api.paddle.com'
        : 'https://sandbox-api.paddle.com'

    const response = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paddleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price_id: productId, quantity: 1 }],
        customer_id: subscription?.paddleCustomerId || undefined,
        customer: !subscription?.paddleCustomerId
          ? { email: dbUser.email }
          : undefined,
        custom_data: { userId: user.id },
        checkout: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/session?upgraded=true`,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Paddle transaction creation error:', errorData)
      throw new Error('Failed to create Paddle transaction')
    }

    const data = await response.json()
    const checkoutUrl = data.data?.checkout?.url

    return NextResponse.json({
      checkoutUrl,
      transactionId: data.data?.id,
    })
  } catch (err: any) {
    console.error('Paddle checkout creation error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
