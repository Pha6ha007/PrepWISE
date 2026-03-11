import { NextRequest, NextResponse } from 'next/server'
import { paddle, getPlanFromPriceId } from '@/lib/paddle/client'
import { prisma } from '@/lib/prisma'
import { EventName } from '@paddle/paddle-node-sdk'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('paddle-signature')
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('PADDLE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  // 1. Читаем raw body для верификации подписи
  const rawBody = await request.text()

  // 2. Верифицируем подпись — ОБЯЗАТЕЛЬНО перед любой обработкой
  let event
  try {
    event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
  } catch (err) {
    console.error('Paddle webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 3. Идемпотентная обработка событий
  try {
    switch (event.eventType) {
      case EventName.SubscriptionActivated:
      case EventName.SubscriptionUpdated: {
        await handleSubscriptionActivated(event.data)
        break
      }

      case EventName.SubscriptionCanceled: {
        await handleSubscriptionCanceled(event.data)
        break
      }

      default:
        // Остальные события игнорируем
        break
    }
  } catch (err) {
    console.error(`Error processing Paddle event ${event.eventType}:`, err)
    // Возвращаем 200 чтобы Paddle не ретраил — логируем для разбора вручную
    return NextResponse.json({ received: true, error: 'Processing error' })
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionActivated(subscription: any) {
  // Извлекаем userId из customData — НИКОГДА не из email
  const userId = subscription.customData?.userId
  if (!userId) {
    console.error('Paddle webhook: missing userId in customData', subscription.id)
    return
  }

  // Определяем план по priceId первого item подписки
  const priceId = subscription.items?.[0]?.price?.id
  const plan = priceId ? getPlanFromPriceId(priceId) : null

  if (!plan) {
    console.error('Paddle webhook: unknown priceId', priceId)
    return
  }

  // Upsert подписки (идемпотентно — событие может прийти дважды)
  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        paddleCustomerId: subscription.customerId ?? '',
        paddleSubscriptionId: subscription.id,
        plan,
        status: 'active',
        expiresAt: subscription.currentBillingPeriod?.endsAt
          ? new Date(subscription.currentBillingPeriod.endsAt)
          : null,
      },
      update: {
        paddleCustomerId: subscription.customerId ?? '',
        paddleSubscriptionId: subscription.id,
        plan,
        status: 'active',
        expiresAt: subscription.currentBillingPeriod?.endsAt
          ? new Date(subscription.currentBillingPeriod.endsAt)
          : null,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { plan },
    }),
  ])
}

async function handleSubscriptionCanceled(subscription: any) {
  const subscriptionId = subscription.id

  // Найти подписку по paddleSubscriptionId
  const existing = await prisma.subscription.findFirst({
    where: { paddleSubscriptionId: subscriptionId },
  })

  if (!existing) {
    console.warn('Paddle webhook: subscription not found', subscriptionId)
    return
  }

  // Обновить статус и downgrade план на free (идемпотентно)
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
