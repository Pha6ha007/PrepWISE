import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * SamiWISE Middleware — route protection via Supabase Auth
 *
 * Protected routes:
 * - /dashboard/* — requires authentication + completed onboarding
 * - /onboarding — requires authentication
 *
 * Public routes:
 * - / — landing page
 * - /login, /register — auth pages
 */
export async function middleware(request: NextRequest) {
  // Skip middleware if Supabase is not configured (local dev without DB)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes — require auth
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if onboarding is complete (preferred_name set)
    // If DB query fails (no connection), skip onboarding check — let user through
    try {
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('preferred_name')
        .eq('id', user.id)
        .single()

      if (!dbError && dbUser && (!dbUser.preferred_name || dbUser.preferred_name.trim() === '')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/onboarding'
        return NextResponse.redirect(redirectUrl)
      }
      // If dbError or no dbUser — skip onboarding check (DB not set up yet)
    } catch {
      // DB unreachable — let user through to dashboard
    }
  }

  // Onboarding — require auth but not completed profile
  if (pathname === '/onboarding') {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Auth routes — if already logged in, redirect to session
  if ((pathname === '/login' || pathname === '/register') && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard/session'
    return NextResponse.redirect(redirectUrl)
  }

  // Add security headers to all responses
  const response = supabaseResponse
  response.headers.set('X-Frame-Options', 'ALLOWALL')
  response.headers.set('Content-Security-Policy', "frame-ancestors *")
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
