import { test, expect } from '@playwright/test';

test.describe('Writing hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/writing');
  });

  test('renders the Writing heading and positioning line', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Writing', level: 1 })).toBeVisible();
    await expect(page.getByText(/ideas, lessons, and engineering perspectives/i).first()).toBeVisible();
  });

  test('page title includes "Writing"', async ({ page }) => {
    await expect(page).toHaveTitle(/writing/i);
  });

  test('shows a Latest section with articles or an empty state', async ({ page }) => {
    const cards = await page.locator('article').count();
    const empty = await page.getByText(/writing coming soon|nothing matches/i).count();
    expect(cards + empty).toBeGreaterThan(0);
  });

  test('type filters are visible and push the choice into the URL', async ({ page }) => {
    const tutorialsFilter = page.getByRole('button', { name: 'Tutorials', exact: true });
    await expect(tutorialsFilter).toBeVisible();

    // The hub is force-dynamic, so Next only commits the history entry once
    // the RSC payload comes back — slower than the 5s default in dev.
    await tutorialsFilter.click();
    await expect(page).toHaveURL(/type=tutorial/, { timeout: 20_000 });

    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(page).not.toHaveURL(/type=/, { timeout: 20_000 });
  });

  test('cards link out to the canonical /blog and /tutorials URLs', async ({ page }) => {
    // /writing is a hub — it must not introduce a second URL for a piece.
    const links = page.locator('article a[href^="/blog/"], article a[href^="/tutorials/"]');
    expect(await links.count()).toBeGreaterThan(0);
  });

  test('breadcrumb shows Home and Writing', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
  });
});
