import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Read environment variables from .env.test for local admin credentials.
 * See: https://playwright.dev/docs/test-configuration
 */

export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/admin.json');

export default defineConfig({
  testDir: './tests/end-to-end-tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:9003',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup project — runs global-setup to log in once and save auth state
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },

    // Unauthenticated tests (public pages + auth redirect checks)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /admin\/(?!auth)/,
    },

    // Authenticated admin tests — reuse saved login session
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testMatch: /admin\/(?!auth)/,
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:9003',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
