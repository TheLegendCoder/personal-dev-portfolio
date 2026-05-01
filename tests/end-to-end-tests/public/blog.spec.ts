import { test, expect } from '@playwright/test';

test.describe('Blog listing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
  });

  test('renders the Blog heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible();
  });

  test('page title includes "Blog"', async ({ page }) => {
    await expect(page).toHaveTitle(/blog/i);
  });

  test('displays blog posts or an empty state', async ({ page }) => {
    // Either blog post cards are shown, or an empty state message
    const hasCards = await page.locator('article, [data-testid="blog-card"]').count();
    const hasEmptyState = await page.getByText(/no posts yet|no articles/i).count();
    expect(hasCards + hasEmptyState).toBeGreaterThan(0);
  });
});

test.describe('Blog post page', () => {
  test('navigating to a post slug renders the post content', async ({ page }) => {
    await page.goto('/blog');

    // Target a stable link within the first post card.
    const firstCard = page.locator('article').first();
    const readMoreLink = firstCard.getByRole('link', { name: 'Read More' });
    const count = await readMoreLink.count();

    if (count === 0) {
      test.skip(); // No posts to navigate to
    }

    await expect(readMoreLink).toHaveAttribute('href', /^\/blog\/[^/]+$/);

    await Promise.all([
      page.waitForURL('**/blog/*', { timeout: 15_000 }),
      readMoreLink.click(),
    ]);

    await expect(page).toHaveURL(/\/blog\/[^/]+$/);
    // Post page should have an article heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
