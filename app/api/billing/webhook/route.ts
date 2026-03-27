// app/api/billing/webhook/route.ts
// DEPRECATED: This was the Dodo Payments webhook handler.
// Paddle webhooks are now handled at /api/webhooks/paddle/route.ts
// This file is kept for backward compatibility during migration.

import { NextResponse } from 'next/server'

export async function POST() {
  console.warn('Dodo webhook endpoint called — deprecated. Use /api/webhooks/paddle instead.')
  return NextResponse.json({ error: 'This endpoint is deprecated. Use /api/webhooks/paddle' }, { status: 410 })
}
