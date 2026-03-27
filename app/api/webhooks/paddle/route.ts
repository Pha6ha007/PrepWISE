import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPlanFromProductId, verifyPaddleWebhook } from '@/lib/billing/paddle'

/**
 * Paddle webhook handler.
 * Handles subscription lifecycle events: created, activated, canceled, past_due, etc.
 * Paddle webhook handler.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('PADDLE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  // 1. Verify Paddle webhook signature
  const signature = request.headers.get('paddle-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  const rawBody = await request.text()

  const isValid = await verifyPaddleWebhook(rawBody, signature, webhookSecret)
  if (!isValid) {
    console.error('Paddle webhook: signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 2. Parse payload
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 3. Handle events
  try {
    const eventType = payload.event_type
    const data = payload.data

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.activated': {
        await handleSubscriptionActivated(data)
        break
      }

      case 'subscription.updated': {
        await handleSubscriptionUpdated(data)
        break
      }

      case 'subscription.canceled': {
        await handleSubscriptionCanceled(data)
        break
      }

      case 'subscription.past_due': {
        await handleSubscriptionPastDue(data)
        break
      }

      case 'subscription.trialing': {
        await handleSubscriptionTrialing(data)
        break
      }

      case 'transaction.completed': {
        // Log successful payment
        console.log('Paddle: transaction completed', data?.id)
        break
      }

      case 'transaction.payment_failed': {
        console.error('Paddle: payment failed', data?.id)
        break
      }

      default:
        // Ignore unknown events
        break
    }
  } catch (err) {
    console.error(`Error processing Paddle webhook ${payload.event_type}:`, err)
    // Return 200 so Paddle doesn't retry
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionActivated(subscription: any) {
  const userId = subscription.custom_data?.userId
  if (!userId) {
    console.error('Paddle webhook: missing userId in custom_data', subscription.id)
    return
  }

  // Determine plan from the first item's price_id
  const priceId = subscription.items?.[0]?.price?.id
  const plan = priceId ? getPlanFromProductId(priceId) : null

  if (!plan) {
    console.error('Paddle webhook: unknown price_id', priceId)
    return
  }

  // Upsert subscription (idempotent)
  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        paddleCustomerId: subscription.customer_id ?? '',
        paddleSubscriptionId: subscription.id,
        plan,
        status: 'active',
        expiresAt: subscription.current_billing_period?.ends_at
          ? new Date(subscription.current_billing_period.ends_at)
          : null,
        trialEndsAt: subscription.trial_dates?.ends_at
          ? new Date(subscription.trial_dates.ends_at)
          : null,
      },
      update: {
        paddleCustomerId: subscription.customer_id ?? '',
        paddleSubscriptionId: subscription.id,
        plan,
        status: 'active',
        expiresAt: subscription.current_billing_period?.ends_at
          ? new Date(subscription.current_billing_period.ends_at)
          : null,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { plan },
    }),
  ])
}

async function handleSubscriptionUpdated(subscription: any) {
  const existing = await prisma.subscription.findFirst({
    where: { paddleSubscriptionId: subscription.id },
  })

  if (!existing) {
    console.warn('Paddle webhook: subscription not found for update', subscription.id)
    return
  }

  const priceId = subscription.items?.[0]?.price?.id
  const plan = priceId ? getPlanFromProductId(priceId) : existing.plan

  const status = mapPaddleStatus(subscription.status)

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan: plan ?? existing.plan,
        status,
        expiresAt: subscription.current_billing_period?.ends_at
          ? new Date(subscription.current_billing_period.ends_at)
          : existing.expiresAt,
      },
    }),
    prisma.user.update({
      where: { id: existing.userId },
      data: { plan: plan ?? existing.plan },
    }),
  ])
}

async function handleSubscriptionCanceled(subscription: any) {
  const existing = await prisma.subscription.findFirst({
    where: { paddleSubscriptionId: subscription.id },
  })

  if (!existing) {
    console.warn('Paddle webhook: subscription not found for cancellation', subscription.id)
    return
  }

  // Downgrade to free
  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: 'cancelled',
        plan: 'free',
      },
    }),
    prisma.user.update({
      where: { id: existing.userId },
      data: { plan: 'free' },
    }),
  ])
}

async function handleSubscriptionPastDue(subscription: any) {
  const existing = await prisma.subscription.findFirst({
    where: { paddleSubscriptionId: subscription.id },
  })

  if (!existing) return

  await prisma.subscription.update({
    where: { id: existing.id },
    data: { status: 'past_due' },
  })
}

async function handleSubscriptionTrialing(subscription: any) {
  const userId = subscription.custom_data?.userId
  if (!userId) return

  const priceId = subscription.items?.[0]?.price?.id
  const plan = priceId ? getPlanFromProductId(priceId) : null

  if (!plan) return

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        paddleCustomerId: subscription.customer_id ?? '',
        paddleSubscriptionId: subscription.id,
        plan,
        status: 'trialing',
        trialEndsAt: subscription.trial_dates?.ends_at
          ? new Date(subscription.trial_dates.ends_at)
          : null,
      },
      update: {
        plan,
        status: 'trialing',
        trialEndsAt: subscription.trial_dates?.ends_at
          ? new Date(subscription.trial_dates.ends_at)
          : null,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { plan },
    }),
  ])
}

function mapPaddleStatus(paddleStatus: string): string {
  const statusMap: Record<string, string> = {
    active: 'active',
    canceled: 'cancelled',
    past_due: 'past_due',
    paused: 'on_hold',
    trialing: 'trialing',
  }
  return statusMap[paddleStatus] || paddleStatus
}
