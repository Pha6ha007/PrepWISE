import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const RequestSchema = z.object({
  priceId: z.string().min(1),
})

// Возвращает priceId + customerId для Paddle.js overlay checkout на клиенте
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

  const { priceId } = parsed.data

  // 3. Проверить что priceId валидный (один из наших)
  const validPriceIds = [
    process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
    process.env.NEXT_PUBLIC_PADDLE_PREMIUM_PRICE_ID,
  ]
  if (!validPriceIds.includes(priceId)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
  }

  // 4. Получить данные пользователя из БД
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, plan: true },
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // 5. Проверить что пользователь не подписан на этот план
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  })

  if (subscription?.status === 'active') {
    return NextResponse.json(
      { error: 'Already subscribed. Manage your subscription in settings.' },
      { status: 409 }
    )
  }

  // 6. Вернуть данные для Paddle.js checkout overlay
  // customData передаёт userId в webhook — НИКОГДА не передаём через email
  return NextResponse.json({
    priceId,
    customerEmail: dbUser.email,
    customData: { userId: user.id },
  })
}
