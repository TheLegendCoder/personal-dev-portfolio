import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../playwright/.auth/admin.json');

/**
 * Global setup — logs into the admin panel once and saves the session
 * cookies to playwright/.auth/admin.json so authenticated tests can
 * reuse the session without logging in again.
 *
 * Requires env vars:
 *   PLAYWRIGHT_ADMIN_EMAIL
 *   PLAYWRIGHT_ADMIN_PASSWORD
 *
 * Set these in a .env.test file (which is git-ignored).
 */
setup('authenticate as admin', async ({ page }) => {
  const email = process.env.PLAYWRIGHT_ADMIN_EMAIL;
  const password = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD must be set.\n' +
        'Create a .env.test file with these values and load it before running:\n' +
        '  $env:PLAYWRIGHT_ADMIN_EMAIL="your@email.com"\n' +
        '  $env:PLAYWRIGHT_ADMIN_PASSWORD="yourpassword"'
    );
  }

  await page.goto('/admin/login');

  // Wait for the login form to be visible
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await Promise.all([
    page.waitForURL('**/admin/blog', {
      timeout: 30_000,
      waitUntil: 'domcontentloaded',
    }),
    page.getByRole('button', { name: /sign in/i }).click(),
  ]);

  // Assert a stable admin landing UI before saving state.
  await expect(page).toHaveURL(/\/admin\/blog/);
  await expect(page.getByRole('heading', { name: /blog posts/i })).toBeVisible();

  // Save the authenticated session state
  await page.context().storageState({ path: authFile });
});
