import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 20_000,
  retries: 1,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  webServer: {
    command: 'DATABASE_URL="postgresql://d:d@localhost:5432/d" npx next dev --port 3001',
    port: 3001,
    timeout: 60_000,
    reuseExistingServer: true,
  },
})
