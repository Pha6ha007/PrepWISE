import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase клиент для браузера (Client Components)
 *
 * Используй в:
 * - 'use client' компонентах
 * - Event handlers
 * - Client-side операциях
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
