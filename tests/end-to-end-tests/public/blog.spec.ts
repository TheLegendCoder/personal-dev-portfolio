import { test, expect } from '@playwright/test';

test.describe('Blog index redirect', () => {
  test('/blog permanently redirects to the merged Writing index', async ({ page }) => {
    const response = await page.goto('/blog');

    await expect(page).toHaveURL(/\/writing\?type=articles$/);
    // 301, not 302 — old backlinks should transfer, not just follow.
    const chain = response?.request().redirectedFrom();
    expect(chain).not.toBeNull();
    expect((await chain!.response())?.status()).toBe(301);
  });
});

test.describe('Blog post page', () => {
  test('post URLs still resolve directly, with no redirect', async ({ page }) => {
    await page.goto('/writing?type=articles');

    const readMoreLink = page
      .locator('article')
      .first()
      .getByRole('link', { name: 'Read More' });
    test.skip((await readMoreLink.count()) === 0, 'no published articles to open');

    await expect(readMoreLink).toHaveAttribute('href', /^\/blog\/[^/]+$/);
    const href = await readMoreLink.getAttribute('href');

    const response = await page.goto(href!);
    expect(response?.request().redirectedFrom()).toBeNull();

    await expect(page).toHaveURL(/\/blog\/[^/]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
