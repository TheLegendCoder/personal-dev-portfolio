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

  test('has a "View My Work" CTA link to the Work hub', async ({ page }) => {
    const cta = page.getByRole('link', { name: /view my work/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/work');
  });

  test('has a "Contact Me" CTA link to the Contact page', async ({ page }) => {
    // Was a scroll-to-footer button before /contact existed.
    const cta = page.getByRole('link', { name: /contact me/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/contact');
  });

  test('navigation bar is visible with the top-level IA links', async ({ page }) => {
    const nav = page.getByRole('banner').getByRole('navigation');
    await expect(nav).toBeVisible();
    // Blog/Tutorials/Projects moved under the Work and Writing hubs.
    await expect(nav.getByRole('link', { name: 'Work', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Writing', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'About', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Now', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Contact', exact: true })).toBeVisible();
  });

  test('page title is set correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/tsholofelo|portfolio/i);
  });
});
