import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the hero section with name and CTA', async ({ page }) => {
    // The h1 contains "Hi, I'm" and the first name
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText("Hi, I'm");
  });

  test('has a "View My Work" CTA link to /projects', async ({ page }) => {
    const cta = page.getByRole('link', { name: /view my work/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/projects');
  });

  test('navigation bar is visible with key links', async ({ page }) => {
    const nav = page.getByRole('banner').getByRole('navigation');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: /blog/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /projects/i })).toBeVisible();
  });

  test('page title is set correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/tsholofelo|portfolio/i);
  });
});
