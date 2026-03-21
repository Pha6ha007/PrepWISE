import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1, // retry once for flaky network/compile delays
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 30_000,
    reuseExistingServer: true,
  },
})
