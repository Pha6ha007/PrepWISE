# GSD Preferences — PrepWISE

## Verification Commands

```bash
# E2E smoke tests (32 tests, ~40s)
npm run test:e2e

# TypeScript + Next.js build check
DATABASE_URL="postgresql://d:d@localhost:5432/d" npx next build

# Prisma schema validation
DATABASE_URL="postgresql://d:d@localhost:5432/d" npx prisma generate
```

## Conventions

- Test files: `e2e/smoke.spec.ts` (main suite)
- Dev server: port 3001 (`npx next dev --port 3001`)
- Build requires `DATABASE_URL` env var (any valid PostgreSQL URL for type generation)
