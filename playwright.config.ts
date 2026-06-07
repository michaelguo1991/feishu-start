import { defineConfig, devices } from '@playwright/test'

const port = 3011
const baseURL = `http://localhost:${port}/feishu-app`

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      channel: 'chrome',
    },
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
  globalSetup: './e2e/global-setup.ts',
  webServer: {
    command: 'npm run dev:e2e',
    url: `${baseURL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      E2E_TEST_MODE: 'true',
      VITE_E2E_TEST_MODE: 'true',
      PORT: String(port),
      DATABASE_PATH: '.data/e2e.sqlite',
      SESSION_SECRET: 'e2e-test-session-secret-fixed',
      FEISHU_APP_ID: 'cli_e2e_test_app',
      FEISHU_APP_SECRET: 'e2e-test-app-secret',
      APP_BASE_URL: baseURL,
      NODE_ENV: 'development',
    },
  },
})
