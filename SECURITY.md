# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in PrepWISE, please report it responsibly:

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email: security@samiwise.app (or use the contact form at /contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for a fix.

## Security Measures

### Authentication & Authorization
- Supabase Auth (email + Google OAuth)
- JWT-based session management
- Middleware protection on all /dashboard/* routes
- Auth check on all API routes (15/15 protected)

### Data Protection
- Row Level Security (RLS) on all 21 database tables
- User data isolation — users can only access their own data
- Prisma ORM — parameterized queries (SQL injection safe)
- Input validation with Zod on all form endpoints

### Infrastructure
- HTTPS enforced (Vercel + HSTS header)
- Security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- API rate limiting on all public endpoints
- Webhook signature verification (Paddle HMAC)
- File upload: 25MB limit + format whitelist

### Secrets
- No secrets in git repository
- Environment variables managed through Vercel
- Supabase Service Role Key: server-side only
- NEXT_PUBLIC_ variables: only non-sensitive values

### Monitoring
- GitHub Actions: weekly security audit (npm audit, CodeQL, TruffleHog)
- Dependabot: automatic dependency updates
- Vercel: runtime error monitoring
