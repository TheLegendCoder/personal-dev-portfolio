import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test('toggles dark mode from the navbar and persists across reload', async ({
    page,
  }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole('button', { name: /switch to dark theme/i }).click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);

    await page.getByRole('button', { name: /switch to light theme/i }).click();
    await expect(html).not.toHaveClass(/dark/);

    await page.reload();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('applies a stored dark preference before first paint (no flash)', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // The inline head script runs pre-paint, so the class must already be set
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(hasDark).toBe(true);
  });

  test('follows the OS preference when no theme is stored', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
