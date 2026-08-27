import { test, expect } from '@playwright/test';

test.describe('Tutorials index redirect', () => {
  test('/tutorials permanently redirects to the merged Writing index', async ({ page }) => {
    const response = await page.goto('/tutorials');

    await expect(page).toHaveURL(/\/writing\?type=tutorials$/);
    const chain = response?.request().redirectedFrom();
    expect(chain).not.toBeNull();
    expect((await chain!.response())?.status()).toBe(301);
  });
});
