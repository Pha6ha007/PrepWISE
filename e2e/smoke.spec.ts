import { test, expect, type Page } from '@playwright/test'

// ─── Helpers ────────────────────────────────────────────────

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

function expectNoFatalErrors(errors: string[], label: string) {
  // Filter out known non-fatal warnings (Supabase not configured is expected in dev)
  const fatal = errors.filter(
    (e) =>
      !e.includes('Supabase') &&
      !e.includes('supabase') &&
      !e.includes('NEXT_PUBLIC_SUPABASE')
  )
  if (fatal.length) {
    throw new Error(`[${label}] Fatal JS errors:\n${fatal.join('\n')}`)
  }
}

// ─── PUBLIC PAGES — render without errors ───────────────────

test.describe('Public pages load correctly', () => {
  const pages = [
    { path: '/', name: 'Landing', expect: 'SamiWISE' },
    { path: '/login', name: 'Login', expect: 'Sign in' },
    { path: '/register', name: 'Register', expect: 'Create' },
    { path: '/onboarding', name: 'Onboarding', expect: 'Sign in' }, // Redirects to login (requires auth)
    { path: '/privacy', name: 'Privacy', expect: 'Privacy' },
    { path: '/terms', name: 'Terms', expect: 'Terms' },
    { path: '/offline', name: 'Offline', expect: 'offline' },
  ]

  for (const { path, name, expect: text } of pages) {
    test(`${name} (${path}) — loads and contains "${text}"`, async ({ page }) => {
      const errors = collectErrors(page)
      const res = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(res?.status(), `${name} returned error status`).toBeLessThan(400)

      const body = await page.textContent('body')
      expect(body?.toLowerCase()).toContain(text.toLowerCase())

      expectNoFatalErrors(errors, name)
    })
  }
})

// ─── LANDING PAGE CONTENT ───────────────────────────────────

test.describe('Landing page content', () => {
  test('has SamiWISE branding, not Confide', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const body = await page.textContent('body')
    expect(body).toContain('SamiWISE')
    expect(body).toContain('GMAT')
    expect(body).toContain('Sam')
    expect(body).not.toContain('Confide')
    expect(body).not.toContain('Alex')
    expect(body).not.toContain('wellness')
  })

  test('has CTA buttons', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('a[href="/login"]').first()).toBeVisible()
    await expect(page.locator('a[href="/register"]').first()).toBeVisible()
  })

  test('pricing section exists with 3 plans', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const body = await page.textContent('body')
    expect(body).toContain('$49')
    expect(body).toContain('$99')
    expect(body).toContain('$199')
    expect(body).toContain('Starter')
    expect(body).toContain('Pro')
    expect(body).toContain('Intensive')
  })
})

// ─── AUTH REDIRECTS ─────────────────────────────────────────

test.describe('Dashboard pages redirect to login', () => {
  const protectedPaths = [
    '/dashboard/session',
    '/dashboard/practice',
    '/dashboard/journal',
    '/dashboard/progress',
    '/dashboard/mock-test',
    '/dashboard/settings',
  ]

  for (const path of protectedPaths) {
    test(`${path} → /login`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      // Should redirect to login (middleware or layout redirect)
      await page.waitForURL('**/login**', { timeout: 10_000 })
      expect(page.url()).toContain('/login')
    })
  }
})

// ─── LOGIN PAGE UX ──────────────────────────────────────────

test.describe('Login page', () => {
  test('has email and password inputs', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('has link to register', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('a[href="/register"]')).toBeVisible()
  })
})

// ─── REGISTER PAGE UX ──────────────────────────────────────

test.describe('Register page', () => {
  test('has email, password, confirm password', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('input[type="email"]')).toBeVisible()
    const pwInputs = page.locator('input[type="password"]')
    expect(await pwInputs.count()).toBeGreaterThanOrEqual(2)
  })

  test('has link to login', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('a[href="/login"]')).toBeVisible()
  })
})

// ─── ONBOARDING FLOW ────────────────────────────────────────

test.describe('Onboarding flow', () => {
  test.skip('shows welcome, navigates through steps', async ({ page }) => {
    // Skipped: requires authenticated session (Google OAuth)
    // Onboarding redirects to /login without auth
    await page.goto('/onboarding', { waitUntil: 'networkidle' })

    // Step 1: Welcome
    await expect(page.locator('text=Welcome to SamiWISE')).toBeVisible()
    await expect(page.locator('text=I\'m Sam, your AI GMAT tutor')).toBeVisible()

    // Wait for hydration then click
    const btn = page.getByRole('button', { name: /get started/i })
    await expect(btn).toBeEnabled()
    await btn.click()

    // Step 2: Profile — wait for state change
    await expect(page.getByText('What should I call you?')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('input[placeholder*="first name" i]')).toBeVisible()
    await expect(page.locator('text=Target score')).toBeVisible()
  })
})

// ─── API ENDPOINTS — auth protection ────────────────────────

test.describe('API auth protection', () => {
  const postEndpoints = [
    '/api/agents/chat',
    '/api/memory',
    '/api/onboarding',
    '/api/billing/create-checkout',
    '/api/journal',
    '/api/review',
  ]

  for (const path of postEndpoints) {
    test(`POST ${path} → 401`, async ({ request }) => {
      const res = await request.post(path, {
        data: { message: 'test' },
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status(), `${path} should require auth`).toBe(401)
    })
  }

  test('GET /api/user/me → 401', async ({ request }) => {
    const res = await request.get('/api/user/me')
    expect(res.status()).toBe(401)
  })

  test('GET /api/journal → 401', async ({ request }) => {
    const res = await request.get('/api/journal')
    expect(res.status()).toBe(401)
  })

  test('GET /api/review → 401', async ({ request }) => {
    const res = await request.get('/api/review')
    expect(res.status()).toBe(401)
  })

  test('POST /api/billing/webhook → 410 (deprecated)', async ({ request }) => {
    const res = await request.post('/api/billing/webhook', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(410)
  })
})

// ─── API ENDPOINTS — validation ─────────────────────────────

test.describe('API validation', () => {
  test('POST /api/contact — rejects invalid body', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: { name: 'x' },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(400)
  })
})

// ─── 404 HANDLING ───────────────────────────────────────────

test('non-existent page returns 404', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist', { waitUntil: 'commit' })
  expect(res?.status()).toBe(404)
})

// ─── NO CONFIDE BRANDING ANYWHERE ───────────────────────────

test.describe('No Confide branding on key pages', () => {
  const pagesToCheck = ['/', '/login']

  for (const path of pagesToCheck) {
    test(`${path} has zero Confide references`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      const body = await page.textContent('body')
      expect(body).not.toContain('Confide')
      // Allow "confidence" but not "Confide" as a brand
      const confideCount = (body?.match(/\bConfide\b/g) || []).length
      expect(confideCount).toBe(0)
    })
  }
})
