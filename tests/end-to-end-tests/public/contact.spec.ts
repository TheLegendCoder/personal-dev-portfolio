import { test, expect } from '@playwright/test';

test.describe('Contact page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('renders the Contact heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contact', level: 1 })).toBeVisible();
  });

  test('page title includes "Contact"', async ({ page }) => {
    await expect(page).toHaveTitle(/contact/i);
  });

  test('lists reachable channels with real hrefs', async ({ page }) => {
    const main = page.locator('section').first();
    await expect(main.getByRole('link', { name: /linkedin/i })).toHaveAttribute(
      'href',
      /linkedin\.com/
    );
    await expect(main.getByRole('link', { name: /github/i }).first()).toHaveAttribute(
      'href',
      /github\.com/
    );
  });

  test('shows availability and what I am open to', async ({ page }) => {
    await expect(page.getByText(/open to opportunities/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /what i'm open to/i })).toBeVisible();
  });

  test('is reachable from the navbar', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('banner').getByRole('navigation');
    await nav.getByRole('link', { name: 'Contact', exact: true }).click();
    await expect(page).toHaveURL(/\/contact$/, { timeout: 20_000 });
  });
});
