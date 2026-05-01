import { test, expect } from '@playwright/test';

test.describe('About page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('renders the "About Me" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'About Me', level: 1 })).toBeVisible();
  });

  test('page title includes "About"', async ({ page }) => {
    await expect(page).toHaveTitle(/about/i);
  });

  test('intro text is visible', async ({ page }) => {
    // The intro paragraph is rendered from aboutContent.intro
    const intro = page.locator('p.text-xl');
    await expect(intro).toBeVisible();
  });

  test('breadcrumb shows Home and About links', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(breadcrumb.getByText('About')).toBeVisible();
  });
});
