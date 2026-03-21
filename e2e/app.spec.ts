import { test, expect, type Page } from '@playwright/test'

// ─── helpers ────────────────────────────────────────────────────
function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

function expectNoErrors(errors: string[], label: string) {
  if (errors.length) {
    throw new Error(`[${label}] JS errors:\n${errors.join('\n')}`)
  }
}

// ─── PUBLIC PAGES ───────────────────────────────────────────────

test.describe('Public pages load without errors', () => {
  const pages = [
    { path: '/', name: 'Landing' },
    { path: '/login', name: 'Login' },
    { path: '/register', name: 'Register' },
    { path: '/privacy', name: 'Privacy' },
    { path: '/terms', name: 'Terms' },
    { path: '/contact', name: 'Contact' },
    { path: '/refund', name: 'Refund' },
    { path: '/support', name: 'Support' },
    { path: '/blog', name: 'Blog' },
    { path: '/offline', name: 'Offline' },
  ]

  for (const { path, name } of pages) {
    test(`${name} (${path})`, async ({ page }) => {
      const errors = collectErrors(page)
      const res = await page.goto(path, { waitUntil: 'commit' })
      expect(res?.status(), `${name} returned non-200`).toBeLessThan(400)
      expectNoErrors(errors, name)
    })
  }
})

// ─── AUTH REDIRECTS ─────────────────────────────────────────────

test.describe('Auth redirects', () => {
  const protectedPaths = [
    '/dashboard/chat',
    '/dashboard/journal',
    '/dashboard/progress',
    '/dashboard/settings',
    '/dashboard/exercises',
    '/onboarding',
  ]

  for (const path of protectedPaths) {
    test(`${path} → /login`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'commit' })
      await page.waitForURL('**/login**', { timeout: 15_000 })
      expect(page.url()).toContain('/login')
    })
  }
})

// ─── API HEALTH (unauthenticated → 401) ────────────────────────

test.describe('API endpoints return 401 for unauthenticated requests', () => {
  const getEndpoints = [
    '/api/user/me',
    '/api/chat/sessions',
    '/api/journal',
    '/api/goals',
    '/api/homework',
    '/api/mood?period=month',
    '/api/wordcloud',
    '/api/diary/list',
    '/api/proactive',
    '/api/survey/check',
  ]

  const postEndpoints = [
    '/api/memory',
    '/api/mood',
    '/api/onboarding',
  ]

  for (const path of getEndpoints) {
    test(`GET ${path} → 401`, async ({ request }) => {
      const res = await request.get(path)
      expect(res.status(), `GET ${path} should be 401`).toBe(401)
    })
  }

  for (const path of postEndpoints) {
    test(`POST ${path} → 401`, async ({ request }) => {
      const res = await request.post(path, {
        data: { message: 'test' },
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status(), `POST ${path} should be 401`).toBe(401)
    })
  }
})

// ─── LANDING PAGE CONTENT ───────────────────────────────────────

test.describe('Landing page content', () => {
  test('has header with logo and CTA buttons', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=Confide').first()).toBeVisible()
    await expect(page.locator('a[href="/login"]').first()).toBeVisible()
    await expect(page.locator('a[href="/register"]').first()).toBeVisible()
  })

  test('pricing section exists', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const pricing = page.locator('#pricing')
    if (await pricing.count() > 0) {
      await expect(pricing).toBeVisible()
    } else {
      await expect(page.locator('text=/free|pro|premium/i').first()).toBeVisible()
    }
  })
})

// ─── LOGIN PAGE UX ──────────────────────────────────────────────

test.describe('Login page UX', () => {
  test('has email and password inputs and submit button', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('has link to register', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('a[href="/register"]')).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    // pressSequentially triggers React onChange for controlled inputs
    await page.locator('input[type="email"]').click()
    await page.locator('input[type="email"]').pressSequentially('fake@example.com', { delay: 20 })
    await page.locator('input[type="password"]').click()
    await page.locator('input[type="password"]').pressSequentially('wrongpassword', { delay: 20 })
    await page.click('button[type="submit"]')
    // Wait for Supabase to return error — the loading state shows "Signing in..."
    // then error appears in a styled alert box
    await expect(page.locator('text=/Invalid|credentials|error|unexpected/i').first()).toBeVisible({
      timeout: 15_000,
    })
  })
})

// ─── REGISTER PAGE UX ──────────────────────────────────────────

test.describe('Register page UX', () => {
  test('has email, password, confirm password inputs', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('input[type="email"]')).toBeVisible()
    const passwordInputs = page.locator('input[type="password"]')
    expect(await passwordInputs.count()).toBeGreaterThanOrEqual(2)
  })

  test('shows error when passwords do not match', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    // Focus and type each field — pressSequentially triggers React onChange reliably
    const emailInput = page.locator('input[type="email"]')
    await emailInput.click()
    await emailInput.pressSequentially('test@example.com', { delay: 20 })
    const passwordInputs = page.locator('input[type="password"]')
    await passwordInputs.nth(0).click()
    await passwordInputs.nth(0).pressSequentially('password123', { delay: 20 })
    await passwordInputs.nth(1).click()
    await passwordInputs.nth(1).pressSequentially('differentpass', { delay: 20 })
    await page.click('button[type="submit"]')
    // First validation: passwords don't match → shows error OR length error
    const errorBox = page.locator('[class*="bg-red"]').first()
    await expect(errorBox).toBeVisible({ timeout: 5_000 })
  })

  test('has link to login', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('a[href="/login"]')).toBeVisible()
  })
})

// ─── BLOG PAGES ─────────────────────────────────────────────────

test.describe('Blog pages', () => {
  test('blog index shows articles', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/blog', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=Read article').first()).toBeVisible()
    expectNoErrors(errors, 'Blog index')
  })

  test('blog article page loads', async ({ page }) => {
    const errors = collectErrors(page)
    const res = await page.goto('/blog/understanding-anxiety-signs-coping', {
      waitUntil: 'domcontentloaded',
    })
    expect(res?.status()).toBeLessThan(400)
    expectNoErrors(errors, 'Blog article')
  })
})

// ─── 404 HANDLING ───────────────────────────────────────────────

test('non-existent page returns 404', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist', {
    waitUntil: 'commit',
  })
  expect(res?.status()).toBe(404)
})
