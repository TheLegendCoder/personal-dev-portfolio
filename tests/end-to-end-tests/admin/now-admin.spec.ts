import { test, expect } from '@playwright/test';

/**
 * Admin /now editor.
 * Runs with storageState (authenticated) — see playwright.config.ts chromium-admin project.
 *
 * Read-only checks: the editor writes to the single shared portfolio_now row, so
 * these specs deliberately do not save (a save would bump the live "Last updated"
 * date), mirroring the other admin specs.
 */
test.describe('Admin now page editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/now');
  });

  test('renders the Now editor with a Save button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /now page/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
  });

  test('shows the seeded sections and an Add section control', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add section/i })).toBeVisible();
    for (const heading of ['Building', 'Learning', 'Exploring', 'Writing']) {
      await expect(page.locator(`input[value="${heading}"]`)).toBeVisible();
    }
  });

  test('has an intro paragraph field with a live preview', async ({ page }) => {
    await expect(page.getByLabel(/markdown source/i)).toBeVisible();
    await expect(page.getByText(/live preview/i)).toBeVisible();
  });
});
