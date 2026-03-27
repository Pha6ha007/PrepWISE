# Security Architecture — PrepWISE

> Updated: 2026-03-27
> Status: Production-ready

---

## Security Scorecard

| Category | Score | Details |
|----------|-------|---------|
| **Authentication** | 10/10 | Supabase Auth, JWT, middleware protection |
| **Authorization** | 10/10 | RLS on 21 tables, user data isolation |
| **API Security** | 9/10 | Auth on 15/15 routes, rate limiting, Zod validation |
| **Infrastructure** | 9/10 | HSTS, security headers, HTTPS enforced |
| **Dependency Security** | 8/10 | Dependabot, weekly npm audit, CodeQL |
| **Secret Management** | 10/10 | No secrets in git, Vercel env vars |
| **Monitoring** | 8/10 | GitHub Actions weekly scan, TruffleHog |
| **Overall** | **9.1/10** | |

---

## Layer 1: Authentication & Authorization

### Authentication
- **Provider:** Supabase Auth (email/password + Google OAuth)
- **Session:** JWT-based, server-side validation via `supabase.auth.getUser()`
- **Middleware:** `middleware.ts` protects all `/dashboard/*` routes
- **Redirect:** Unauthenticated users → `/login` with return URL

### API Route Protection
All 15 protected API routes verify auth before processing:

| Route | Auth | Rate Limit | Input Validation |
|-------|------|-----------|-----------------|
| /api/chat | ✅ | ✅ DB-based | ✅ Zod |
| /api/agents/stream | ✅ | — | — |
| /api/agents/chat | ✅ | — | — |
| /api/voice | ✅ | ✅ DB-based | ✅ File validation |
| /api/tts | ✅ | ✅ DB-based | ✅ Zod |
| /api/tts/stream | ✅ | — | — |
| /api/memory | ✅ | — | ✅ Zod |
| /api/journal | ✅ | — | — |
| /api/study-plan | ✅ | — | — |
| /api/review | ✅ | — | — |
| /api/practice/questions | ✅ | — | — |
| /api/onboarding | ✅ | — | ✅ Zod |
| /api/user/me | ✅ | — | — |
| /api/user/profile | ✅ | — | ✅ Zod |
| /api/billing/create-checkout | ✅ | — | ✅ Zod |

Public routes (intentionally open):
| Route | Protection |
|-------|-----------|
| /api/support | IP rate limit (10/min) |
| /api/contact | IP rate limit (3/min) + Zod |
| /api/webhooks/paddle | HMAC signature verification |
| /api/billing/webhook | Deprecated (returns 410) |

### Row Level Security (RLS)
Enabled on ALL 21 database tables via Supabase RLS policies:

```sql
-- Every user-owned table has:
CREATE POLICY "own" ON table_name FOR ALL
  USING (auth.uid() = user_id);

-- System tables blocked from client:
CREATE POLICY "server only" ON rate_limits FOR ALL USING (false);
```

**Effect:** Even if someone obtains the Supabase anon key, they cannot:
- Read other users' data
- Modify other users' records
- Access system tables (rate_limits)
- Write to read-only tables (knowledge_base)

---

## Layer 2: Security Headers

Applied via `middleware.ts` and `next.config.js`:

| Header | Value | Protects Against |
|--------|-------|-----------------|
| X-Frame-Options | DENY | Clickjacking |
| X-Content-Type-Options | nosniff | MIME type sniffing |
| X-XSS-Protection | 1; mode=block | Cross-site scripting |
| Referrer-Policy | strict-origin-when-cross-origin | Referer leakage |
| Permissions-Policy | camera=(), microphone=(self), geolocation=() | Unauthorized API access |
| Strict-Transport-Security | max-age=31536000; includeSubDomains | Downgrade attacks |
| Cache-Control (API) | no-store, no-cache, must-revalidate | Cached sensitive data |

---

## Layer 3: Input Validation & Injection Prevention

### SQL Injection
- **Prisma ORM** — all database queries use parameterized queries
- No raw SQL queries anywhere in the application code
- 15 API routes use Prisma — zero raw SQL

### Input Validation
- **Zod schemas** on 7 API routes validate all user input
- File upload: 25MB limit + whitelist (audio/webm, audio/wav, audio/mp3, etc.)
- Contact form: validated fields + rate limited

### XSS Prevention
- React auto-escapes all rendered content
- No `dangerouslySetInnerHTML` usage
- Content-Type-Options: nosniff prevents MIME confusion

---

## Layer 4: Webhook Security

### Paddle Webhooks
```typescript
// Verifies HMAC-SHA256 signature on every webhook
const signature = request.headers.get('paddle-signature')
const isValid = await verifyPaddleWebhook(rawBody, signature, webhookSecret)
```

---

## Layer 5: Secret Management

### What's in git (safe):
- Source code, config files, public assets
- `.env.example` with key names only (no values)

### What's NOT in git:
- `.env` and `.env.local` — in `.gitignore`
- API keys, database credentials, service role keys
- All secrets managed through Vercel Environment Variables

### Client-exposed variables (intentionally public):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key (safe with RLS)
- `NEXT_PUBLIC_APP_NAME` — "Prepwise"
- `NEXT_PUBLIC_APP_URL` — site URL

### Server-only secrets:
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS, server-only
- `OPENROUTER_API_KEY` — AI agent responses
- `GROQ_API_KEY` — routing + STT
- `OPENAI_API_KEY` — embeddings
- `PINECONE_API_KEY` — vector search
- `ELEVENLABS_API_KEY` — text-to-speech
- `DEEPGRAM_API_KEY` — speech-to-text
- `PADDLE_WEBHOOK_SECRET` — webhook verification
- `DATABASE_URL` — PostgreSQL connection

---

## Layer 6: Automated Security Monitoring

### GitHub Actions (`.github/workflows/security.yml`)
Runs on: every push, every PR, weekly (Monday 9 AM UTC)

| Scanner | What it does | Severity |
|---------|-------------|----------|
| **npm audit** | Scans dependencies for known CVEs | High+ |
| **CodeQL** | Static analysis for JS/TS vulnerabilities | Critical |
| **TruffleHog** | Scans git history for leaked secrets | Critical |
| **Dependency Review** | Blocks PRs adding vulnerable deps | High+ |

### Dependabot (`.github/dependabot.yml`)
- Weekly dependency update PRs
- Auto-groups minor/patch updates
- Labels: `dependencies`, `security`
- Also updates GitHub Actions versions

---

## Layer 7: Rate Limiting

| Endpoint | Limit | Method |
|----------|-------|--------|
| /api/chat | Per plan (free: 10/10min, pro: 50/10min) | DB-based (PostgreSQL) |
| /api/voice | Per plan | DB-based |
| /api/tts | Per plan | DB-based |
| /api/support | 10/min per IP | In-memory (Map) |
| /api/contact | 3/min per IP | In-memory (Map) |

---

## Known Limitations & Future Improvements

### Current (acceptable for launch):
- 20 npm vulnerabilities in indirect dependencies (rollup-plugin-terser via next-pwa) — not exploitable in production
- In-memory rate limiting on support/contact — resets on serverless cold start (acceptable volume)
- No WAF (Web Application Firewall) — Vercel provides basic DDoS protection

### Future improvements ($5K+ MRR):
- [ ] Sentry — real-time error monitoring and alerting
- [ ] Vercel Firewall — WAF rules for API abuse
- [ ] SOC 2 Type I compliance audit
- [ ] Penetration test by third-party
- [ ] IP geoblocking (if needed for compliance)
- [ ] GDPR data export/deletion automation
- [ ] Session timeout configuration
- [ ] Two-factor authentication (2FA)
