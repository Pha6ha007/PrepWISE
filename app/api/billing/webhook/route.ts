import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPlanFromProductId } from '@/lib/dodo/client'

// Webhook handler — верификация подписи и обработка событий Dodo Payments
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('DODO_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  // 1. Верификация подписи
  const signature = request.headers.get('webhook-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  const rawBody = await request.text()

  // Верифицируем HMAC-SHA256 подпись
  try {
    const { createHmac } = await import('crypto')
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Dodo webhook: signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } catch (err) {
    console.error('Dodo webhook: signature verification error', err)
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 })
  }

  // 2. Парсим payload
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 3. Обработка событий
  try {
    const eventType = payload.type
    const data = payload.data

    switch (eventType) {
      case 'subscription.active': {
        await handleSubscriptionActivated(data)
        break
      }

      case 'subscription.plan_changed':
      case 'subscription.renewed': {
        await handleSubscriptionUpdated(data)
        break
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        await handleSubscriptionCanceled(data)
        break
      }

      case 'subscription.on_hold': {
        await handleSubscriptionOnHold(data)
        break
      }

      case 'subscription.failed': {
        console.error('Dodo webhook: subscription failed', data?.subscription_id)
        break
      }

      default:
        // Игнорируем неизвестные события
        break
    }
  } catch (err) {
    console.error(`Error processing Dodo webhook ${payload.type}:`, err)
    // Не бросаем — возвращаем 200 чтобы Dodo не ретраил
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionActivated(subscription: any) {
  // Извлекаем userId из metadata — НИКОГДА не из email
  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error('Dodo webhook: missing userId in metadata', subscription.subscription_id)
    return
  }

  // Определяем план по product_id
  const productId = subscription.product_id
  const plan = productId ? getPlanFromProductId(productId) : null

  if (!plan) {
    console.error('Dodo webhook: unknown product_id', productId)
    return
  }

  // Upsert подписки (идемпотентно — событие может прийти дважды)
  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        dodoCustomerId: subscription.customer?.customer_id ?? '',
        dodoSubscriptionId: subscription.subscription_id,
        plan,
        status: 'active',
        expiresAt: subscription.next_billing_date
          ? new Date(subscription.next_billing_date)
          : null,
      },
      update: {
        dodoCustomerId: subscription.customer?.customer_id ?? '',
        dodoSubscriptionId: subscription.subscription_id,
        plan,
        status: 'active',
        expiresAt: subscription.next_billing_date
          ? new Date(subscription.next_billing_date)
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
  const subscriptionId = subscription.subscription_id

  const existing = await prisma.subscription.findFirst({
    where: { dodoSubscriptionId: subscriptionId },
  })

  if (!existing) {
    console.warn('Dodo webhook: subscription not found for update', subscriptionId)
    return
  }

  // Определяем план по product_id (мог измениться при upgrade/downgrade)
  const productId = subscription.product_id
  const plan = productId ? getPlanFromProductId(productId) : existing.plan

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan: plan ?? existing.plan,
        status: 'active',
        expiresAt: subscription.next_billing_date
          ? new Date(subscription.next_billing_date)
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
  const subscriptionId = subscription.subscription_id

  const existing = await prisma.subscription.findFirst({
    where: { dodoSubscriptionId: subscriptionId },
  })

  if (!existing) {
    console.warn('Dodo webhook: subscription not found for cancellation', subscriptionId)
    return
  }

  // Downgrade на free (идемпотентно)
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

async function handleSubscriptionOnHold(subscription: any) {
  const subscriptionId = subscription.subscription_id

  const existing = await prisma.subscription.findFirst({
    where: { dodoSubscriptionId: subscriptionId },
  })

  if (!existing) {
    console.warn('Dodo webhook: subscription not found for hold', subscriptionId)
    return
  }

  // Подписка на паузе из-за неудачного платежа — не downgrade, только статус
  await prisma.subscription.update({
    where: { id: existing.id },
    data: { status: 'on_hold' },
  })
}
