import { test, expect } from '@playwright/test';

test.describe('Now page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/now');
  });

  test('renders the Now heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Now', level: 1 })).toBeVisible();
  });

  test('page title includes "Now"', async ({ page }) => {
    await expect(page).toHaveTitle(/now/i);
  });

  test('shows a last-updated date', async ({ page }) => {
    await expect(page.getByText(/last updated/i)).toBeVisible();
    await expect(page.locator('time').first()).toBeVisible();
  });

  test('renders the sections from src/content/now.md', async ({ page }) => {
    for (const heading of ['Building', 'Learning', 'Exploring', 'Writing']) {
      await expect(page.getByRole('heading', { name: heading, level: 2 })).toBeVisible();
    }
  });

  test('surfaces recent writing', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /recent activity/i })).toBeVisible();
  });
});
