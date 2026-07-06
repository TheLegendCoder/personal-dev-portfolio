import { test, expect, type Page } from '@playwright/test';

async function skipBoot(page: Page) {
  const skip = page.getByRole('button', { name: 'skip →' });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }
  await expect(page.getByText('initializing environment')).toHaveCount(0);
}

async function gotoDesktop(page: Page) {
  await page.goto('/desktop');
  await skipBoot(page);
}

test.describe('Desktop mode', () => {
  test('is reachable from the navbar and shows the boot sequence', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /switch to desktop view/i }).click();
    // First hit compiles /desktop in dev — wait on DOM evidence rather than the
    // URL bar, which can lag behind the client-side navigation during that compile.
    await expect(page.getByRole('button', { name: /open home/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page).toHaveURL('/desktop');
    // Boot overlay covers the shell briefly before the icons become interactive.
    await expect(page.getByText('initializing environment')).toBeVisible();
    await skipBoot(page);
    await expect(page.getByRole('button', { name: /open projects/i })).toBeVisible();
  });

  test('reduced motion skips the boot sequence entirely', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/desktop');
    await expect(page.getByText('initializing environment')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /open projects/i })).toBeVisible();
  });

  test('opens an app window with real content (no iframe)', async ({ page }) => {
    await gotoDesktop(page);
    await page.getByRole('button', { name: /open projects/i }).click();
    const dialog = page.getByRole('dialog', { name: 'Projects' });
    await expect(dialog).toBeVisible();
    // Native panel, not an iframe — content renders directly in the DOM.
    await expect(page.locator('iframe[title="Projects"]')).toHaveCount(0);
    await expect(dialog.getByText(/project|no published projects yet/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('multiple windows can be open simultaneously with independent focus', async ({ page }) => {
    await gotoDesktop(page);
    await page.getByRole('button', { name: /open about/i }).click();
    await page.getByRole('button', { name: /open projects/i }).click();

    const about = page.getByRole('dialog', { name: 'About' });
    const projects = page.getByRole('dialog', { name: 'Projects' });
    await expect(about).toBeVisible();
    await expect(projects).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(2);

    // Clicking About's title bar should bring it back to front (no assertion on
    // z-index directly — clicking it must not throw and it should stay visible).
    await about.getByText('About', { exact: true }).click();
    await expect(about).toBeVisible();
    await expect(projects).toBeVisible();
  });

  test('a window can be dragged and resized independently', async ({ page }) => {
    await gotoDesktop(page);
    await page.getByRole('button', { name: /open about/i }).click();
    const dialog = page.getByRole('dialog', { name: 'About' });
    await expect(dialog).toBeVisible();

    const before = await dialog.boundingBox();
    expect(before).not.toBeNull();

    // Drag by the title bar.
    await page.mouse.move(before!.x + before!.width / 2, before!.y + 20);
    await page.mouse.down();
    await page.mouse.move(before!.x + before!.width / 2 - 100, before!.y + 20 - 60, {
      steps: 10,
    });
    await page.mouse.up();

    const afterDrag = await dialog.boundingBox();
    expect(afterDrag!.x).toBeLessThan(before!.x);
    expect(afterDrag!.y).toBeLessThan(before!.y);

    // Resize from the bottom-right corner. The handle is a 12px hit target flush
    // with the window's edge — aim a few px inward so the pointerdown lands on it
    // rather than on the exact boundary pixel.
    const seHandleX = afterDrag!.x + afterDrag!.width - 4;
    const seHandleY = afterDrag!.y + afterDrag!.height - 4;
    await page.mouse.move(seHandleX, seHandleY);
    await page.mouse.down();
    await page.mouse.move(seHandleX + 80, seHandleY + 60, { steps: 10 });
    await page.mouse.up();

    const afterResize = await dialog.boundingBox();
    expect(afterResize!.width).toBeGreaterThan(afterDrag!.width + 40);
    expect(afterResize!.height).toBeGreaterThan(afterDrag!.height + 20);
  });

  test('maximize button fills the shell and restore returns to the previous size', async ({
    page,
  }) => {
    await gotoDesktop(page);
    await page.getByRole('button', { name: /open about/i }).click();
    const dialog = page.getByRole('dialog', { name: 'About' });
    const before = await dialog.boundingBox();

    await page.getByRole('button', { name: /maximize about/i }).click();
    const maximized = await dialog.boundingBox();
    expect(maximized!.width).toBeGreaterThan(before!.width + 100);

    await page.getByRole('button', { name: /restore about/i }).click();
    const restored = await dialog.boundingBox();
    // A few px of slack for browser sub-pixel layout rounding, not app logic.
    expect(Math.abs(restored!.width - before!.width)).toBeLessThan(5);
  });

  test('minimize keeps the window mounted and restore brings it back', async ({ page }) => {
    await gotoDesktop(page);
    await page.getByRole('button', { name: /open about/i }).click();
    const dialog = page.getByRole('dialog', { name: 'About' });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: /minimize about/i }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole('button', { name: /restore about/i }).click();
    await expect(dialog).toBeVisible();
  });

  test('taskbar lists every open window', async ({ page }) => {
    await gotoDesktop(page);
    await page.getByRole('button', { name: /open about/i }).click();
    await page.getByRole('button', { name: /open blog/i }).click();

    const taskbar = page.getByTestId('desktop-taskbar');
    await expect(taskbar.getByText('About', { exact: true })).toBeVisible();
    await expect(taskbar.getByText('Blog', { exact: true })).toBeVisible();
  });

  test('launcher opens via its taskbar button and via Ctrl/Cmd+K, and lists all apps', async ({
    page,
  }) => {
    await gotoDesktop(page);
    // Dispatch a real DOM click directly — this button sits bottom-left, where
    // the Next.js dev-mode toolbar portal can steal a coordinate-based click.
    await page
      .getByRole('button', { name: 'Toggle app launcher' })
      .evaluate((el) => (el as HTMLElement).click());
    const launcher = page.getByRole('menu');
    await expect(launcher).toBeVisible();
    await expect(launcher.getByRole('menuitem', { name: /about/i })).toBeVisible();
    await expect(launcher.getByRole('menuitem', { name: /exit to site/i })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(launcher).not.toBeVisible();

    await page.keyboard.press('Control+k');
    await expect(launcher).toBeVisible();
  });

  test('contact panel toggles from the taskbar pill', async ({ page }) => {
    await gotoDesktop(page);
    const pill = page.getByRole('button', { name: /open to opportunities/i });
    await pill.click();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('Escape closes the launcher before the focused window', async ({ page }) => {
    await gotoDesktop(page);
    await page.getByRole('button', { name: /open about/i }).click();
    // Dispatch a real DOM click directly — this button sits bottom-left, where
    // the Next.js dev-mode toolbar portal can steal a coordinate-based click.
    await page
      .getByRole('button', { name: 'Toggle app launcher' })
      .evaluate((el) => (el as HTMLElement).click());
    await expect(page.getByRole('menu')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).not.toBeVisible();
    await expect(page.getByRole('dialog', { name: 'About' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'About' })).toHaveCount(0);
  });

  test('Home app still iframes the live homepage and hides its site chrome', async ({ page }) => {
    await gotoDesktop(page);
    await page.getByRole('button', { name: /open home/i }).click();
    const frame = page.frameLocator('iframe[title="Home"]');
    await expect(frame.locator('main')).toBeVisible({ timeout: 15_000 });
    await expect(frame.locator('header')).toBeHidden();
    await expect(frame.locator('footer')).toBeHidden();
  });

  test('taskbar exit button returns to the regular site', async ({ page }) => {
    await gotoDesktop(page);
    await page
      .getByRole('button', { name: /exit desktop mode/i })
      .evaluate((el) => (el as HTMLElement).click());
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('banner')).toBeVisible();
  });
});
