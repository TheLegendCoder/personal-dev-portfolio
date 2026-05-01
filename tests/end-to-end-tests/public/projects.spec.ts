import { test, expect } from '@playwright/test';

test.describe('Projects page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('redirects to /projects?category=all and renders heading', async ({ page }) => {
    // Page auto-redirects to ?category=all
    await expect(page).toHaveURL(/category=all/);
    await expect(page.getByRole('heading', { name: /my projects/i, level: 1 })).toBeVisible();
  });

  test('page title includes "Projects"', async ({ page }) => {
    await expect(page).toHaveTitle(/projects/i);
  });

  test('category filter tabs are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /show all projects/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /show professional projects/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /show personal projects/i })).toBeVisible();
  });

  test('displays project cards or an empty state', async ({ page }) => {
    const cards = await page.locator('article, [data-testid="project-card"]').count();
    const empty = await page.getByText(/no projects/i).count();
    expect(cards + empty).toBeGreaterThan(0);
  });
});
