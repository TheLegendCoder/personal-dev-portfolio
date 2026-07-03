import { test, expect } from '@playwright/test';

test.describe('Desktop mode', () => {
  test('is reachable from the navbar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /switch to desktop view/i }).click();
    await expect(page).toHaveURL('/desktop');
    await expect(
      page.getByRole('button', { name: /open projects/i })
    ).toBeVisible();
  });

  test('opens an app in a window whose iframe hides the site chrome', async ({
    page,
  }) => {
    await page.goto('/desktop');
    await page.getByRole('button', { name: /open projects/i }).click();

    const dialog = page.getByRole('dialog', { name: 'Projects' });
    await expect(dialog).toBeVisible();

    const frame = page.frameLocator('iframe[title="Projects"]');
    // Generous timeout: the dev server compiles the iframed route on first hit
    await expect(frame.locator('main')).toBeVisible({ timeout: 30_000 });
    // html.embedded CSS hides the header/footer inside desktop windows
    await expect(frame.locator('header')).toBeHidden();
    await expect(frame.locator('footer')).toBeHidden();
  });

  test('opening another app replaces the current window', async ({ page }) => {
    await page.goto('/desktop');
    await page.getByRole('button', { name: /open projects/i }).click();
    await expect(page.getByRole('dialog', { name: 'Projects' })).toBeVisible();

    await page.getByRole('button', { name: /open about/i }).click();
    await expect(page.getByRole('dialog', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(1);
  });

  test('window can be dragged by its title bar', async ({ page }) => {
    await page.goto('/desktop');
    await page.getByRole('button', { name: /open projects/i }).click();

    const dialog = page.getByRole('dialog', { name: 'Projects' });
    await expect(dialog).toBeVisible();
    const before = await dialog.boundingBox();
    expect(before).not.toBeNull();

    // Drag by the title bar (avoid the traffic-light buttons on the left)
    await page.mouse.move(before!.x + before!.width / 2, before!.y + 20);
    await page.mouse.down();
    await page.mouse.move(
      before!.x + before!.width / 2 - 120,
      before!.y + 20 - 60,
      { steps: 10 }
    );
    await page.mouse.up();

    const after = await dialog.boundingBox();
    expect(after!.x).toBeLessThan(before!.x);
    expect(after!.y).toBeLessThan(before!.y);
  });

  test('minimize keeps the app alive in the taskbar and restore brings it back', async ({
    page,
  }) => {
    await page.goto('/desktop');
    await page.getByRole('button', { name: /open projects/i }).click();

    const dialog = page.getByRole('dialog', { name: 'Projects' });
    await expect(dialog).toBeVisible();

    // The title-bar button (the taskbar pill has the same accessible name)
    await dialog.getByRole('button', { name: /minimize projects/i }).click();
    await expect(dialog).toBeHidden();
    // The iframe stays mounted while minimized
    await expect(page.locator('iframe[title="Projects"]')).toHaveCount(1);

    await page.getByRole('button', { name: /restore projects/i }).click();
    await expect(dialog).toBeVisible();
  });

  test('Escape closes the open window', async ({ page }) => {
    await page.goto('/desktop');
    await page.getByRole('button', { name: /open about/i }).click();
    await expect(page.getByRole('dialog', { name: 'About' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('theme set from the settings app applies to the top document', async ({
    page,
  }) => {
    await page.goto('/desktop');
    await page.getByRole('button', { name: /open settings/i }).click();
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();

    await page.getByRole('radio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.getByRole('radio', { name: 'Light' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('taskbar exit button returns to the regular site', async ({ page }) => {
    await page.goto('/desktop');
    await page.getByRole('button', { name: /exit desktop mode/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('banner')).toBeVisible();
  });
});
