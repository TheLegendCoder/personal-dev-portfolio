import { test, expect } from '@playwright/test';

/**
 * Admin blog CRUD flows.
 * Runs with storageState (authenticated) — see playwright.config.ts chromium-admin project.
 */
test.describe('Admin blog management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/blog');
  });

  test('renders the Blog Posts heading and stats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Blog Posts', level: 1 })).toBeVisible();
    // Stats row labels
    await expect(page.getByText('Total')).toBeVisible();
    await expect(page.getByText('Published')).toBeVisible();
  });

  test('has a "New post" link to /admin/blog/new', async ({ page }) => {
    const newPostLink = page.getByRole('link', { name: /new post/i });
    await expect(newPostLink).toBeVisible();
    await expect(newPostLink).toHaveAttribute('href', '/admin/blog/new');
  });

  test('navigates to the new post form', async ({ page }) => {
    await page.getByRole('link', { name: /new post/i }).click();
    await expect(page).toHaveURL('/admin/blog/new');
    // Form should be visible with a title field
    await expect(page.getByRole('heading', { name: /new post|create post/i })).toBeVisible();
  });

  test('new post form has required fields', async ({ page }) => {
    await page.goto('/admin/blog/new');
    await expect(page.getByLabel(/title/i)).toBeVisible();
    await expect(page.getByLabel(/description|excerpt/i).first()).toBeVisible();
  });
});
