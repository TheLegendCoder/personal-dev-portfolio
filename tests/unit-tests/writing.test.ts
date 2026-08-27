import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — must come before importing the module under test.
// writing.ts composes the blog/tutorial data layer, so those are the seam.
// ---------------------------------------------------------------------------

vi.mock('@/lib/blog', () => ({
  getBlogPostsSummaryWithStatus: vi.fn(),
}));

vi.mock('@/lib/tutorial', () => ({
  getTutorialsSummaryWithStatus: vi.fn(),
}));

import {
  getUnifiedWriting,
  getUnifiedWritingWithStatus,
  filterWritingByType,
} from '@/lib/writing';
import type { WritingItem } from '@/lib/writing';
import { getBlogPostsSummaryWithStatus } from '@/lib/blog';
import { getTutorialsSummaryWithStatus } from '@/lib/tutorial';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function summary(slug: string, date: string, featured = false) {
  return {
    slug,
    title: `Title ${slug}`,
    description: `Description ${slug}`,
    date,
    author: 'Author',
    tags: ['React'],
    readTime: '4 min read',
    published: true,
    featured,
    image: 'https://images.test/cover.png',
    imageHint: 'cover',
  };
}

function mockSources(
  posts: ReturnType<typeof summary>[],
  tutorials: ReturnType<typeof summary>[],
  errors: { posts?: boolean; tutorials?: boolean } = {},
) {
  vi.mocked(getBlogPostsSummaryWithStatus).mockResolvedValue({
    data: posts,
    error: errors.posts ?? false,
  });
  vi.mocked(getTutorialsSummaryWithStatus).mockResolvedValue({
    data: tutorials,
    error: errors.tutorials ?? false,
  });
}

// ---------------------------------------------------------------------------
// getUnifiedWriting()
// ---------------------------------------------------------------------------

describe('getUnifiedWriting()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merges posts and tutorials into a single list', async () => {
    mockSources([summary('post-a', '2026-05-01')], [summary('tut-a', '2026-04-01')]);

    const items = await getUnifiedWriting();

    expect(items).toHaveLength(2);
    expect(items.map((i) => i.slug)).toEqual(['post-a', 'tut-a']);
  });

  it('tags each item with its source type', async () => {
    mockSources([summary('post-a', '2026-05-01')], [summary('tut-a', '2026-04-01')]);

    const items = await getUnifiedWriting();

    expect(items.find((i) => i.slug === 'post-a')?.type).toBe('article');
    expect(items.find((i) => i.slug === 'tut-a')?.type).toBe('tutorial');
  });

  it('sorts the merged list by date, newest first, across both sources', async () => {
    mockSources(
      [summary('post-old', '2026-01-01'), summary('post-new', '2026-06-01')],
      [summary('tut-mid', '2026-03-01')],
    );

    const items = await getUnifiedWriting();

    expect(items.map((i) => i.slug)).toEqual(['post-new', 'tut-mid', 'post-old']);
  });

  it('preserves the original summary fields', async () => {
    mockSources([summary('post-a', '2026-05-01', true)], []);

    const [item] = await getUnifiedWriting();

    expect(item).toMatchObject({
      slug: 'post-a',
      title: 'Title post-a',
      description: 'Description post-a',
      readTime: '4 min read',
      featured: true,
      tags: ['React'],
      imageHint: 'cover',
    });
  });

  it('returns an empty list when neither source has rows', async () => {
    mockSources([], []);

    await expect(getUnifiedWriting()).resolves.toEqual([]);
  });

  it('fetches both sources concurrently', async () => {
    mockSources([], []);

    await getUnifiedWriting();

    expect(getBlogPostsSummaryWithStatus).toHaveBeenCalledTimes(1);
    expect(getTutorialsSummaryWithStatus).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// getUnifiedWritingWithStatus()
// ---------------------------------------------------------------------------

describe('getUnifiedWritingWithStatus()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports no error when both sources succeed', async () => {
    mockSources([summary('post-a', '2026-05-01')], []);

    await expect(getUnifiedWritingWithStatus()).resolves.toMatchObject({ error: false });
  });

  it('reports an error when the posts fetch fails', async () => {
    mockSources([], [summary('tut-a', '2026-04-01')], { posts: true });

    await expect(getUnifiedWritingWithStatus()).resolves.toMatchObject({ error: true });
  });

  it('reports an error when the tutorials fetch fails', async () => {
    mockSources([summary('post-a', '2026-05-01')], [], { tutorials: true });

    await expect(getUnifiedWritingWithStatus()).resolves.toMatchObject({ error: true });
  });

  it('distinguishes a genuinely empty result from a failure', async () => {
    mockSources([], []);

    await expect(getUnifiedWritingWithStatus()).resolves.toEqual({ data: [], error: false });
  });
});

// ---------------------------------------------------------------------------
// filterWritingByType()
// ---------------------------------------------------------------------------

describe('filterWritingByType()', () => {
  const items = [
    { ...summary('post-a', '2026-05-01'), type: 'article' },
    { ...summary('tut-a', '2026-04-01'), type: 'tutorial' },
  ] as WritingItem[];

  it('returns everything for "all"', () => {
    expect(filterWritingByType(items, 'all')).toHaveLength(2);
  });

  it('returns only articles for "article"', () => {
    expect(filterWritingByType(items, 'article').map((i) => i.slug)).toEqual(['post-a']);
  });

  it('returns only tutorials for "tutorial"', () => {
    expect(filterWritingByType(items, 'tutorial').map((i) => i.slug)).toEqual(['tut-a']);
  });

  it('does not mutate the input list', () => {
    filterWritingByType(items, 'article');

    expect(items).toHaveLength(2);
  });
});
