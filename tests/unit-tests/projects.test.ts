import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase/server', () => ({
  createAnonClient: vi.fn(),
  createServiceClient: vi.fn(),
}));

import {
  getProjects,
  getFeaturedProjects,
} from '@/lib/projects';
import { createAnonClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    then: (resolve: (v: typeof result) => void) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

function makeMockAnonClient(from: (table: string) => unknown): ReturnType<typeof createAnonClient> {
  return { from } as unknown as ReturnType<typeof createAnonClient>;
}

function makeProjectRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'proj-1',
    title: 'My Project',
    description: 'A cool project',
    category: 'web' as const,
    tags: ['react', 'typescript'],
    image: 'https://example.com/img.jpg',
    image_hint: 'screenshot',
    live_url: 'https://example.com',
    github_url: 'https://github.com/example/repo',
    published: true,
    featured: false,
    sort_order: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getProjects()
// ---------------------------------------------------------------------------

describe('getProjects()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array when Supabase reports an error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const builder = makeQueryBuilder({ data: null, error: { message: 'db error', code: '500' } });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getProjects();
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('returns an empty array when Supabase returns null data', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getProjects();
    expect(result).toEqual([]);
  });

  it('returns all rows on success', async () => {
    const rows = [makeProjectRow({ id: 'p1' }), makeProjectRow({ id: 'p2' })];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getProjects();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('p1');
    expect(result[1].id).toBe('p2');
  });

  it('queries with published=true filter', async () => {
    const builder = makeQueryBuilder({ data: [], error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    await getProjects();
    expect(builder.eq).toHaveBeenCalledWith('published', true);
  });
});

// ---------------------------------------------------------------------------
// getFeaturedProjects()
// ---------------------------------------------------------------------------

describe('getFeaturedProjects()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array when Supabase reports an error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const builder = makeQueryBuilder({ data: null, error: { message: 'db error', code: '500' } });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getFeaturedProjects();
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('returns an empty array when Supabase returns null data', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getFeaturedProjects();
    expect(result).toEqual([]);
  });

  it('returns only featured rows on success', async () => {
    const rows = [makeProjectRow({ id: 'f1', featured: true })];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getFeaturedProjects();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('f1');
  });

  it('queries with both published=true and featured=true filters', async () => {
    const builder = makeQueryBuilder({ data: [], error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    await getFeaturedProjects();
    expect(builder.eq).toHaveBeenCalledWith('published', true);
    expect(builder.eq).toHaveBeenCalledWith('featured', true);
  });
});
