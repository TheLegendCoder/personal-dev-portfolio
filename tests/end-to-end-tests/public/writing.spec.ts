import { test, expect } from '@playwright/test';

test.describe('Writing index page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/writing');
  });

  test('renders the Writing heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Writing', level: 1 })).toBeVisible();
  });

  test('page title includes "Writing"', async ({ page }) => {
    await expect(page).toHaveTitle(/writing/i);
  });

  test('displays writing cards or an empty state', async ({ page }) => {
    const cards = await page.locator('article').count();
    const empty = await page.getByText(/nothing here yet/i).count();
    expect(cards + empty).toBeGreaterThan(0);
  });

  test('type tabs filter the list via ?type=', async ({ page }) => {
    await page.getByRole('link', { name: 'Articles', exact: true }).click();
    await expect(page).toHaveURL(/\/writing\?type=articles$/);

    await page.getByRole('link', { name: 'Tutorials', exact: true }).click();
    await expect(page).toHaveURL(/\/writing\?type=tutorials$/);
  });

  test('article and tutorial cards link at their unchanged URLs', async ({ page }) => {
    const links = page.getByRole('link', { name: 'Read More' });
    const count = await links.count();
    test.skip(count === 0, 'no published writing to link to');

    for (let i = 0; i < count; i += 1) {
      await expect(links.nth(i)).toHaveAttribute('href', /^\/(blog|tutorials)\/[^/]+$/);
    }
  });
});
