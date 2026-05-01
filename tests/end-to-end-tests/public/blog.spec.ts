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

    // Find the first post link and navigate to it
    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    const count = await firstPostLink.count();

    if (count === 0) {
      test.skip(); // No posts to navigate to
    }

    const href = await firstPostLink.getAttribute('href');
    await firstPostLink.click();

    await expect(page).toHaveURL(new RegExp(`/blog/${href?.split('/blog/')[1]}`));
    // Post page should have an article heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
