import { test, expect } from '@playwright/test';

test.describe('Writing topic pages', () => {
  test('renders a canonical topic page', async ({ page }) => {
    await page.goto('/writing/topic/architecture');

    await expect(page.getByRole('heading', { name: 'Architecture', level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(/architecture/i);
  });

  test('handles the topics whose slugs are not plain lowercase', async ({ page }) => {
    await page.goto('/writing/topic/c-sharp');
    await expect(page.getByRole('heading', { name: 'C#', level: 1 })).toBeVisible();

    await page.goto('/writing/topic/dotnet');
    await expect(page.getByRole('heading', { name: '.NET', level: 1 })).toBeVisible();
  });

  test('shows matching writing or an empty state', async ({ page }) => {
    await page.goto('/writing/topic/architecture');

    const cards = await page.locator('article').count();
    const empty = await page.getByText(/nothing on architecture yet/i).count();
    expect(cards + empty).toBeGreaterThan(0);
  });

  test('404s on a topic that is not in the canonical list', async ({ page }) => {
    // Arbitrary tags must not mint an indexable page each.
    const response = await page.goto('/writing/topic/not-a-real-topic');
    expect(response?.status()).toBe(404);
  });

  test('links back to the writing hub', async ({ page }) => {
    await page.goto('/writing/topic/architecture');
    await expect(page.getByRole('link', { name: /all writing/i })).toHaveAttribute(
      'href',
      '/writing'
    );
  });

  test('is reachable from the hub topic list', async ({ page }) => {
    await page.goto('/writing');
    const link = page.getByRole('link', { name: 'Architecture', exact: true });
    await expect(link).toHaveAttribute('href', '/writing/topic/architecture');
  });
});
