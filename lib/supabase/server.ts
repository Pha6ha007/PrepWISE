import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase клиент для сервера (Server Components, API Routes)
 *
 * Используй в:
 * - Server Components
 * - API Routes
 * - Server Actions
 * - Middleware
 *
 * ВАЖНО: Всегда await cookies() перед использованием
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // setAll вызывается из Server Component
            // Можно игнорировать если это read-only операция
          }
        },
      },
    }
  )
}
