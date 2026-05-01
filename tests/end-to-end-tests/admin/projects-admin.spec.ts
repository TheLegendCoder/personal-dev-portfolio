import { test, expect } from '@playwright/test';

/**
 * Admin projects CRUD flows.
 * Runs with storageState (authenticated) — see playwright.config.ts chromium-admin project.
 */
test.describe('Admin projects management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/projects');
  });

  test('renders the Projects heading and stats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Projects', level: 1 })).toBeVisible();
    await expect(page.getByText('Total')).toBeVisible();
  });

  test('has a "New project" link to /admin/projects/new', async ({ page }) => {
    const newLink = page.getByRole('link', { name: /new project/i });
    await expect(newLink).toBeVisible();
    await expect(newLink).toHaveAttribute('href', '/admin/projects/new');
  });

  test('navigates to the new project form', async ({ page }) => {
    await page.getByRole('link', { name: /new project/i }).click();
    await expect(page).toHaveURL('/admin/projects/new');
    await expect(page.getByRole('heading', { name: /new project|create project/i })).toBeVisible();
  });

  test('new project form has required fields', async ({ page }) => {
    await page.goto('/admin/projects/new');
    await expect(page.getByLabel(/title/i)).toBeVisible();
    await expect(page.getByLabel(/description/i).first()).toBeVisible();
  });
});
