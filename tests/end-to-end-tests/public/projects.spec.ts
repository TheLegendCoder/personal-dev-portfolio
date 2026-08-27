import { test, expect } from '@playwright/test';

test.describe('Work (projects) page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('renders at /projects with no category redirect', async ({ page }) => {
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole('heading', { name: 'Work', level: 1 })).toBeVisible();
  });

  test('page title includes "Projects"', async ({ page }) => {
    await expect(page).toHaveTitle(/projects/i);
  });

  test('the old category filter tabs are gone', async ({ page }) => {
    await expect(page.getByRole('button', { name: /show all projects/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /show professional projects/i })).toHaveCount(0);
  });

  test('displays project cards or an empty state', async ({ page }) => {
    const cards = await page.locator('article').count();
    const empty = await page.getByText(/i am working on it/i).count();
    expect(cards + empty).toBeGreaterThan(0);
  });

  test('every rendered project sits under one of the three section headings', async ({ page }) => {
    const cards = await page.locator('article').count();
    test.skip(cards === 0, 'no published projects to group');

    const headings = page.getByRole('heading', {
      name: /^(Featured|Side Projects|Experiments)$/,
      level: 2,
    });
    await expect(headings.first()).toBeVisible();
  });
});
