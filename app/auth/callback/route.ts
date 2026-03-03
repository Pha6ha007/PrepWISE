import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * OAuth callback handler для Google Sign-in
 *
 * Supabase редиректит сюда после успешной OAuth аутентификации
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
            } catch {
              // Игнорируем ошибки cookie в middleware
            }
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)
  }

  // Редирект на dashboard после успешной аутентификации
  return NextResponse.redirect(`${origin}/dashboard/chat`)
}
