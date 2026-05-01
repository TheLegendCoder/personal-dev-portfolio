import { test, expect } from '@playwright/test';

test.describe('Tutorials page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tutorials');
  });

  test('renders the Tutorials heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tutorials', level: 1 })).toBeVisible();
  });

  test('page title includes "Tutorials"', async ({ page }) => {
    await expect(page).toHaveTitle(/tutorials/i);
  });

  test('displays tutorial cards or an empty state', async ({ page }) => {
    const cards = await page.locator('article, [data-testid="tutorial-card"]').count();
    const empty = await page.getByText(/no tutorials/i).count();
    expect(cards + empty).toBeGreaterThan(0);
  });
});
