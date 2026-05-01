import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createAnonClient: vi.fn(),
  createServiceClient: vi.fn(),
}));

vi.mock('@/lib/markdown', () => ({
  markdownToHtml: vi.fn(async (content: string) => `<p>${content}</p>`),
}));

import {
  getTutorial,
  getAllTutorials,
  getTutorialsSummary,
  getAllTutorialsSummary,
  getAllTutorialsForSitemap,
  getAllTutorialsAdmin,
  getAllTutorialsAdminSummary,
  getTutorialAdmin,
  upsertTutorial,
  updateTutorialFields,
  deleteTutorial,
} from '@/lib/tutorial';
import { createAnonClient, createServiceClient } from '@/lib/supabase/server';
import { markdownToHtml } from '@/lib/markdown';

function makeQueryBuilder(result: { data: unknown; error: { message: string } | null }) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    upsert: vi.fn().mockResolvedValue(result),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    then: (resolve: (value: typeof result) => void) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

function makeAnonClient(from: (table: string) => unknown): ReturnType<typeof createAnonClient> {
  return { from } as unknown as ReturnType<typeof createAnonClient>;
}

function makeServiceClient(from: (table: string) => unknown): ReturnType<typeof createServiceClient> {
  return { from } as unknown as ReturnType<typeof createServiceClient>;
}

function makeTutorialRow(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'tutorial-1',
    title: 'Tutorial One',
    description: 'A tutorial',
    date: '2026-04-01',
    author: 'Author',
    tags: ['nextjs'],
    read_time: '6 min read',
    published: true,
    featured: false,
    image: 'https://example.com/img.jpg',
    image_hint: 'cover',
    content: '## Tutorial Content',
    ...overrides,
  };
}

describe('tutorial public API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTutorial returns null on query error', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'db error' } });
    vi.mocked(createAnonClient).mockReturnValue(makeAnonClient(() => builder));

    const result = await getTutorial('missing');
    expect(result).toBeNull();
  });

  it('getTutorial maps DB fields and renders markdown', async () => {
    const row = makeTutorialRow({ tags: null });
    const builder = makeQueryBuilder({ data: row, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeAnonClient(() => builder));

    const result = await getTutorial('tutorial-1');

    expect(markdownToHtml).toHaveBeenCalledWith('## Tutorial Content');
    expect(result).toEqual(
      expect.objectContaining({
        slug: row.slug,
        readTime: row.read_time,
        imageHint: row.image_hint,
        content: '<p>## Tutorial Content</p>',
        tags: [],
      }),
    );
  });

  it('getAllTutorials returns empty array on query error', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'db error' } });
    vi.mocked(createAnonClient).mockReturnValue(makeAnonClient(() => builder));

    const result = await getAllTutorials();
    expect(result).toEqual([]);
  });

  it('getAllTutorials maps and renders all rows', async () => {
    const rows = [makeTutorialRow({ slug: 'a' }), makeTutorialRow({ slug: 'b', tags: null })];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeAnonClient(() => builder));

    const result = await getAllTutorials();

    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('a');
    expect(result[1].tags).toEqual([]);
    expect(markdownToHtml).toHaveBeenCalledTimes(2);
  });

  it('getTutorialsSummary maps summary fields', async () => {
    const rows = [makeTutorialRow({ slug: 'sum-1', tags: null })];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeAnonClient(() => builder));

    const result = await getTutorialsSummary();

    expect(result).toEqual([
      expect.objectContaining({
        slug: 'sum-1',
        readTime: '6 min read',
        imageHint: 'cover',
        tags: [],
      }),
    ]);
  });

  it('getAllTutorialsSummary returns empty array when query errors', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'db error' } });
    vi.mocked(createAnonClient).mockReturnValue(makeAnonClient(() => builder));

    const result = await getAllTutorialsSummary();
    expect(result).toEqual([]);
  });

  it('getAllTutorialsForSitemap returns slug/date only', async () => {
    const rows = [
      { slug: 'sitemap-1', date: '2026-03-01' },
      { slug: 'sitemap-2', date: '2026-02-01' },
    ];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeAnonClient(() => builder));

    const result = await getAllTutorialsForSitemap();
    expect(result).toEqual(rows);
  });
});

describe('tutorial admin API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllTutorialsAdmin maps rows and preserves raw markdown content', async () => {
    const rows = [makeTutorialRow({ slug: 'admin-1', content: '# raw md' })];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeServiceClient(() => builder));

    const result = await getAllTutorialsAdmin();

    expect(result).toEqual([
      expect.objectContaining({
        slug: 'admin-1',
        content: '# raw md',
      }),
    ]);
  });

  it('getAllTutorialsAdminSummary returns mapped summary rows', async () => {
    const rows = [makeTutorialRow({ slug: 'admin-sum-1' })];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeServiceClient(() => builder));

    const result = await getAllTutorialsAdminSummary();

    expect(result).toEqual([
      expect.objectContaining({
        slug: 'admin-sum-1',
        readTime: '6 min read',
      }),
    ]);
  });

  it('getTutorialAdmin returns null when no row is found', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'not found' } });
    vi.mocked(createServiceClient).mockReturnValue(makeServiceClient(() => builder));

    const result = await getTutorialAdmin('missing');
    expect(result).toBeNull();
  });

  it('upsertTutorial returns success true when no error', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeServiceClient(() => builder));

    const result = await upsertTutorial({ slug: 'x' } as never);

    expect(result).toEqual({ success: true });
    expect(builder.upsert).toHaveBeenCalledWith({ slug: 'x' }, { onConflict: 'slug' });
  });

  it('upsertTutorial returns success false on supabase error', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'failed upsert' } });
    vi.mocked(createServiceClient).mockReturnValue(makeServiceClient(() => builder));

    const result = await upsertTutorial({ slug: 'x' } as never);

    expect(result).toEqual({ success: false, error: 'failed upsert' });
  });

  it('updateTutorialFields returns success false on query error', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'failed update' } });
    vi.mocked(createServiceClient).mockReturnValue(makeServiceClient(() => builder));

    const result = await updateTutorialFields('tutorial-1', { title: 'Updated' } as never);

    expect(result).toEqual({ success: false, error: 'failed update' });
    expect(builder.update).toHaveBeenCalledWith({ title: 'Updated' });
  });

  it('deleteTutorial returns success true when delete succeeds', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeServiceClient(() => builder));

    const result = await deleteTutorial('tutorial-1');

    expect(result).toEqual({ success: true });
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('slug', 'tutorial-1');
  });
}
);