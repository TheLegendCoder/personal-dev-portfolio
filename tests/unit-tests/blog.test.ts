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
  getAllBlogPostsAdmin,
  getAllBlogPostsAdminSummary,
  getBlogPostAdmin,
  upsertBlogPost,
  updateBlogPostFields,
  deleteBlogPost,
} from '@/lib/blog';
import { createAnonClient, createServiceClient } from '@/lib/supabase/server';

function makeMockServiceClient(from: (table: string) => unknown): ReturnType<typeof createServiceClient> {
  return { from } as unknown as ReturnType<typeof createServiceClient>;
}
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

function makeMockAnonClient(from: (table: string) => unknown): ReturnType<typeof createAnonClient> {
  return { from } as unknown as ReturnType<typeof createAnonClient>;
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
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getBlogPost('missing-slug');
    expect(result).toBeNull();
  });

  it('returns null when Supabase returns no data', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getBlogPost('empty-slug');
    expect(result).toBeNull();
  });

  it('maps snake_case DB fields to camelCase blog post shape', async () => {
    const row = makeDbRow();
    const builder = makeQueryBuilder({ data: row, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

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
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getBlogPost('test-slug');
    expect(result!.tags).toEqual([]);
  });

  it('calls markdownToHtml() and stores the result in content', async () => {
    const row = makeDbRow({ content: '## Heading' });
    const builder = makeQueryBuilder({ data: row, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

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
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getBlogPostsSummary();
    expect(result).toEqual([]);
  });

  it('maps multiple DB rows to BlogPostSummary objects', async () => {
    const rows = [
      makeDbRow({ slug: 'post-1', title: 'Post One' }),
      makeDbRow({ slug: 'post-2', title: 'Post Two', tags: null }),
    ];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

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
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => featuredBuilder));

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
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(fromFn));

    const result = await getTopBlogPosts(3);

    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('recent-1');
  });

  it('respects the limit parameter on the featured query', async () => {
    const featuredRows = [makeDbRow({ slug: 'f-1', featured: true })];
    const builder = makeQueryBuilder({ data: featuredRows, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

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
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getAllBlogPostsForSitemap();
    expect(result).toEqual([]);
  });

  it('returns only slug and date fields', async () => {
    const rows = [
      { slug: 'post-a', date: '2026-03-01' },
      { slug: 'post-b', date: '2026-02-01' },
    ];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getAllBlogPostsForSitemap();

    expect(result).toEqual([
      { slug: 'post-a', date: '2026-03-01' },
      { slug: 'post-b', date: '2026-02-01' },
    ]);
  });
});

// ---------------------------------------------------------------------------
// Admin APIs (use createServiceClient)
// ---------------------------------------------------------------------------

describe('getAllBlogPostsAdmin()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array when Supabase reports an error', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'db error' } });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getAllBlogPostsAdmin();
    expect(result).toEqual([]);
  });

  it('returns an empty array when data is null with no error', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getAllBlogPostsAdmin();
    expect(result).toEqual([]);
  });

  it('maps snake_case DB fields to BlogPost objects', async () => {
    const rows = [makeDbRow({ slug: 'admin-post', title: 'Admin Post' })];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getAllBlogPostsAdmin();

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('admin-post');
    expect(result[0].readTime).toBe('5 min read');
    expect(result[0].imageHint).toBe('A test image');
    expect(result[0].tags).toEqual(['typescript', 'nextjs']);
  });

  it('normalises null tags to empty array', async () => {
    const rows = [makeDbRow({ tags: null })];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getAllBlogPostsAdmin();
    expect(result[0].tags).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

describe('getAllBlogPostsAdminSummary()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array on Supabase error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const builder = makeQueryBuilder({ data: null, error: { message: 'db error' } });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getAllBlogPostsAdminSummary();
    expect(result).toEqual([]);
    consoleErrorSpy.mockRestore();
  });

  it('maps rows to BlogPostSummary objects', async () => {
    const rows = [makeDbRow({ slug: 'summary-1', title: 'Summary One' })];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getAllBlogPostsAdminSummary();

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('summary-1');
    expect(result[0].title).toBe('Summary One');
  });
});

// ---------------------------------------------------------------------------

describe('getBlogPostAdmin()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when Supabase reports an error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const builder = makeQueryBuilder({ data: null, error: { message: 'not found' } });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getBlogPostAdmin('missing');
    expect(result).toBeNull();
    consoleErrorSpy.mockRestore();
  });

  it('returns null when data is null with no error', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getBlogPostAdmin('missing');
    expect(result).toBeNull();
  });

  it('maps DB row to BlogPost object', async () => {
    const row = makeDbRow({ slug: 'my-post', title: 'My Post' });
    const builder = makeQueryBuilder({ data: row, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getBlogPostAdmin('my-post');

    expect(result).not.toBeNull();
    expect(result!.slug).toBe('my-post');
    expect(result!.readTime).toBe('5 min read');
  });
});

// ---------------------------------------------------------------------------

describe('upsertBlogPost()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns { success: true } when upsert succeeds', async () => {
    const builder = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await upsertBlogPost({ slug: 'new-post', title: 'New Post' } as Parameters<typeof upsertBlogPost>[0]);
    expect(result).toEqual({ success: true });
  });

  it('returns { success: false, error } when Supabase returns an error', async () => {
    const builder = {
      upsert: vi.fn().mockResolvedValue({ error: { message: 'constraint violation' } }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await upsertBlogPost({ slug: 'bad' } as Parameters<typeof upsertBlogPost>[0]);
    expect(result.success).toBe(false);
    expect(result.error).toBe('constraint violation');
  });
});

// ---------------------------------------------------------------------------

describe('updateBlogPostFields()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns { success: true } on success', async () => {
    const builder = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await updateBlogPostFields('test-slug', { published: true });
    expect(result).toEqual({ success: true });
  });

  it('returns { success: false, error } on Supabase error', async () => {
    const builder = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'update failed' } }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await updateBlogPostFields('bad-slug', { published: false });
    expect(result.success).toBe(false);
    expect(result.error).toBe('update failed');
  });
});

// ---------------------------------------------------------------------------

describe('deleteBlogPost()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns { success: true } on success', async () => {
    const builder = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await deleteBlogPost('test-slug');
    expect(result).toEqual({ success: true });
  });

  it('returns { success: false, error } on Supabase error', async () => {
    const builder = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'delete failed' } }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await deleteBlogPost('bad-slug');
    expect(result.success).toBe(false);
    expect(result.error).toBe('delete failed');
  });

  it('returns { success: false, error } when createServiceClient throws', async () => {
    vi.mocked(createServiceClient).mockImplementation(() => {
      throw new Error('service client unavailable');
    });

    const result = await deleteBlogPost('any-slug');
    expect(result.success).toBe(false);
    expect(result.error).toContain('service client unavailable');
  });
});

// ---------------------------------------------------------------------------
// Catch-block coverage for admin reads
// ---------------------------------------------------------------------------

describe('getAllBlogPostsAdmin() — exception path', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns empty array when createServiceClient throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(createServiceClient).mockImplementation(() => { throw new Error('no client'); });

    const result = await getAllBlogPostsAdmin();
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('getAllBlogPostsAdminSummary() — exception path', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns empty array when createServiceClient throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(createServiceClient).mockImplementation(() => { throw new Error('no client'); });

    const result = await getAllBlogPostsAdminSummary();
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('getBlogPostAdmin() — exception path', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns null when createServiceClient throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(createServiceClient).mockImplementation(() => { throw new Error('no client'); });

    const result = await getBlogPostAdmin('test-slug');
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('upsertBlogPost() — exception path', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns { success: false, error } when createServiceClient throws', async () => {
    vi.mocked(createServiceClient).mockImplementation(() => { throw new Error('no service client'); });

    const result = await upsertBlogPost({ slug: 'x' } as Parameters<typeof upsertBlogPost>[0]);
    expect(result.success).toBe(false);
    expect(result.error).toContain('no service client');
  });
});

describe('updateBlogPostFields() — exception path', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns { success: false, error } when createServiceClient throws', async () => {
    vi.mocked(createServiceClient).mockImplementation(() => { throw new Error('no service client'); });

    const result = await updateBlogPostFields('slug', { published: true });
    expect(result.success).toBe(false);
    expect(result.error).toContain('no service client');
  });
});

describe('getBlogPostsSummary() — exception path', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns empty array when createAnonClient throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(createAnonClient).mockImplementation(() => { throw new Error('no anon client'); });

    const result = await getBlogPostsSummary();
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('getAllBlogPostsForSitemap() — exception path', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns empty array when createAnonClient throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(createAnonClient).mockImplementation(() => { throw new Error('no anon client'); });

    const result = await getAllBlogPostsForSitemap();
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
