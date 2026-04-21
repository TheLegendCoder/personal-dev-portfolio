import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — must come before importing the module under test
// ---------------------------------------------------------------------------

// Mock the entire Supabase server module so no real network calls are made
vi.mock('@/lib/supabase/server', () => ({
  createAnonClient: vi.fn(),
  createServiceClient: vi.fn(),
}));

// Mock markdownToHtml so we don't spin up remark/rehype in unit tests
vi.mock('@/lib/markdown', () => ({
  markdownToHtml: vi.fn(async (content: string) => `<p>${content}</p>`),
}));

// blog.ts is a Next.js Server Action file — Vitest treats 'use server' as a
// plain string expression, so it is safe to import directly.
import {
  getBlogPost,
  getBlogPostsSummary,
  getTopBlogPosts,
  getAllBlogPostsForSitemap,
} from '@/lib/blog';
import { createAnonClient } from '@/lib/supabase/server';
import { markdownToHtml } from '@/lib/markdown';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal Supabase chainable query builder stub */
function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    // make the builder itself awaitable (resolves at end of chain)
    then: (resolve: (v: typeof result) => void) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

/** A DB row that satisfies the blog post shape */
function makeDbRow(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'test-slug',
    title: 'Test Title',
    description: 'Test description',
    date: '2026-01-01',
    author: 'Author Name',
    tags: ['typescript', 'nextjs'],
    read_time: '5 min read',
    published: true,
    featured: false,
    image: 'https://example.com/image.jpg',
    image_hint: 'A test image',
    content: '## Hello',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getBlogPost()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when Supabase reports an error', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'not found' } });
    vi.mocked(createAnonClient).mockReturnValue({ from: () => builder } as any);

    const result = await getBlogPost('missing-slug');
    expect(result).toBeNull();
  });

  it('returns null when Supabase returns no data', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    vi.mocked(createAnonClient).mockReturnValue({ from: () => builder } as any);

    const result = await getBlogPost('empty-slug');
    expect(result).toBeNull();
  });

  it('maps snake_case DB fields to camelCase blog post shape', async () => {
    const row = makeDbRow();
    const builder = makeQueryBuilder({ data: row, error: null });
    vi.mocked(createAnonClient).mockReturnValue({ from: () => builder } as any);

    const result = await getBlogPost('test-slug');

    expect(result).not.toBeNull();
    expect(result!.slug).toBe(row.slug);
    expect(result!.title).toBe(row.title);
    expect(result!.readTime).toBe(row.read_time);
    expect(result!.imageHint).toBe(row.image_hint);
    expect(result!.tags).toEqual(row.tags);
  });

  it('uses empty array when DB tags column is null', async () => {
    const row = makeDbRow({ tags: null });
    const builder = makeQueryBuilder({ data: row, error: null });
    vi.mocked(createAnonClient).mockReturnValue({ from: () => builder } as any);

    const result = await getBlogPost('test-slug');
    expect(result!.tags).toEqual([]);
  });

  it('calls markdownToHtml() and stores the result in content', async () => {
    const row = makeDbRow({ content: '## Heading' });
    const builder = makeQueryBuilder({ data: row, error: null });
    vi.mocked(createAnonClient).mockReturnValue({ from: () => builder } as any);

    const result = await getBlogPost('test-slug');

    expect(markdownToHtml).toHaveBeenCalledWith('## Heading');
    expect(result!.content).toBe('<p>## Heading</p>');
  });
});

// ---------------------------------------------------------------------------

describe('getBlogPostsSummary()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array on Supabase error', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'db error' } });
    vi.mocked(createAnonClient).mockReturnValue({ from: () => builder } as any);

    const result = await getBlogPostsSummary();
    expect(result).toEqual([]);
  });

  it('maps multiple DB rows to BlogPostSummary objects', async () => {
    const rows = [
      makeDbRow({ slug: 'post-1', title: 'Post One' }),
      makeDbRow({ slug: 'post-2', title: 'Post Two', tags: null }),
    ];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createAnonClient).mockReturnValue({ from: () => builder } as any);

    const result = await getBlogPostsSummary();

    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('post-1');
    expect(result[1].slug).toBe('post-2');
    // null tags normalised to []
    expect(result[1].tags).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

describe('getTopBlogPosts()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns featured posts when they exist', async () => {
    const featuredRows = [makeDbRow({ slug: 'featured-1', featured: true })];

    // First query (featured) returns data; second query (fallback) should not be called
    const featuredBuilder = makeQueryBuilder({ data: featuredRows, error: null });
    vi.mocked(createAnonClient).mockReturnValue({ from: () => featuredBuilder } as any);

    const result = await getTopBlogPosts(3);

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('featured-1');
  });

  it('falls back to most-recent posts when no featured posts exist', async () => {
    const recentRows = [
      makeDbRow({ slug: 'recent-1' }),
      makeDbRow({ slug: 'recent-2' }),
    ];

    // createAnonClient is called once; both queries share the same client.
    // from() is called twice — first for featured (returns []), second for recent.
    let fromCallCount = 0;
    const fromFn = vi.fn().mockImplementation(() => {
      fromCallCount += 1;
      return makeQueryBuilder({
        data: fromCallCount === 1 ? [] : recentRows,
        error: null,
      });
    });
    vi.mocked(createAnonClient).mockReturnValue({ from: fromFn } as any);

    const result = await getTopBlogPosts(3);

    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('recent-1');
  });

  it('respects the limit parameter on the featured query', async () => {
    const featuredRows = [makeDbRow({ slug: 'f-1', featured: true })];
    const builder = makeQueryBuilder({ data: featuredRows, error: null });
    vi.mocked(createAnonClient).mockReturnValue({ from: () => builder } as any);

    const result = await getTopBlogPosts(1);
    // limit is applied in the chain — verify Supabase .limit() was invoked
    expect(builder.limit).toHaveBeenCalledWith(1);
    expect(result).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------

describe('getAllBlogPostsForSitemap()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array on Supabase error', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'db error' } });
    vi.mocked(createAnonClient).mockReturnValue({ from: () => builder } as any);

    const result = await getAllBlogPostsForSitemap();
    expect(result).toEqual([]);
  });

  it('returns only slug and date fields', async () => {
    const rows = [
      { slug: 'post-a', date: '2026-03-01' },
      { slug: 'post-b', date: '2026-02-01' },
    ];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createAnonClient).mockReturnValue({ from: () => builder } as any);

    const result = await getAllBlogPostsForSitemap();

    expect(result).toEqual([
      { slug: 'post-a', date: '2026-03-01' },
      { slug: 'post-b', date: '2026-02-01' },
    ]);
  });
});
