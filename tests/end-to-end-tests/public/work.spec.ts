import { test, expect } from '@playwright/test';

test.describe('Work hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work');
  });

  test('renders the Work heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Work', level: 1 })).toBeVisible();
  });

  test('page title includes "Work"', async ({ page }) => {
    await expect(page).toHaveTitle(/work/i);
  });

  test('splits into Projects and Experiments sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Projects', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Experiments', level: 2 })).toBeVisible();
  });

  test('each section shows cards or an empty state', async ({ page }) => {
    const cards = await page.locator('article').count();
    const empty = await page.getByText(/nothing published here yet/i).count();
    expect(cards + empty).toBeGreaterThan(0);
  });

  test('links back to the full /projects listing', async ({ page }) => {
    await expect(page.getByRole('link', { name: /browse every project/i })).toHaveAttribute(
      'href',
      '/projects'
    );
  });
});
