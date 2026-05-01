import { test, expect } from '@playwright/test';

/**
 * Admin tutorials CRUD flows.
 * Runs with storageState (authenticated) — see playwright.config.ts chromium-admin project.
 */
test.describe('Admin tutorials management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/tutorials');
  });

  test('renders the Tutorials heading and stats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tutorials', level: 1 })).toBeVisible();
    await expect(page.getByText('Total')).toBeVisible();
  });

  test('has a "New tutorial" link to /admin/tutorials/new', async ({ page }) => {
    const newLink = page.getByRole('link', { name: /new tutorial/i });
    await expect(newLink).toBeVisible();
    await expect(newLink).toHaveAttribute('href', '/admin/tutorials/new');
  });

  test('navigates to the new tutorial form', async ({ page }) => {
    await page.getByRole('link', { name: /new tutorial/i }).click();
    await expect(page).toHaveURL('/admin/tutorials/new');
    await expect(page.getByRole('heading', { name: /new tutorial|create tutorial/i })).toBeVisible();
  });

  test('new tutorial form has required fields', async ({ page }) => {
    await page.goto('/admin/tutorials/new');
    await expect(page.getByLabel(/title/i)).toBeVisible();
    await expect(page.getByLabel(/description/i).first()).toBeVisible();
  });
});
