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
  getProjectsByCategory,
  getAllProjectsAdmin,
  getProjectByIdAdmin,
  upsertProject,
  updateProjectFields,
  deleteProject,
} from '@/lib/projects';
import { createAnonClient, createServiceClient } from '@/lib/supabase/server';

function makeMockServiceClient(from: (table: string) => unknown): ReturnType<typeof createServiceClient> {
  return { from } as unknown as ReturnType<typeof createServiceClient>;
}

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

// ---------------------------------------------------------------------------
// getProjectsByCategory()
// ---------------------------------------------------------------------------

describe('getProjectsByCategory()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array on Supabase error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const builder = makeQueryBuilder({ data: null, error: { message: 'db error', code: '500' } });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getProjectsByCategory('web');
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('returns an empty array when data is null with no error', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getProjectsByCategory('web');
    expect(result).toEqual([]);
  });

  it('returns all rows for the given category', async () => {
    const rows = [makeProjectRow({ id: 'w1', category: 'web' }), makeProjectRow({ id: 'w2', category: 'web' })];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    const result = await getProjectsByCategory('web');
    expect(result).toHaveLength(2);
  });

  it('filters by the supplied category value', async () => {
    const builder = makeQueryBuilder({ data: [], error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockAnonClient(() => builder));

    await getProjectsByCategory('mobile');
    expect(builder.eq).toHaveBeenCalledWith('category', 'mobile');
  });
});

// ---------------------------------------------------------------------------
// getAllProjectsAdmin()
// ---------------------------------------------------------------------------

describe('getAllProjectsAdmin()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all rows on success', async () => {
    const rows = [makeProjectRow({ id: 'a1' }), makeProjectRow({ id: 'a2' })];
    const builder = makeQueryBuilder({ data: rows, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getAllProjectsAdmin();
    expect(result).toHaveLength(2);
  });

  it('returns empty array when data is null and no error', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getAllProjectsAdmin();
    expect(result).toEqual([]);
  });

  it('throws when Supabase returns an error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const builder = makeQueryBuilder({ data: null, error: { message: 'db failure', code: '500', details: '' } });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    await expect(getAllProjectsAdmin()).rejects.toThrow('[getAllProjectsAdmin]');
    consoleErrorSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// getProjectByIdAdmin()
// ---------------------------------------------------------------------------

describe('getProjectByIdAdmin()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the project on success', async () => {
    const row = makeProjectRow({ id: 'proj-abc' });
    const builder = makeQueryBuilder({ data: row, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getProjectByIdAdmin('proj-abc');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('proj-abc');
  });

  it('returns null when Supabase reports an error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const builder = makeQueryBuilder({ data: null, error: { message: 'not found', code: '404', details: '' } });
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await getProjectByIdAdmin('missing');
    expect(result).toBeNull();
    consoleErrorSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// upsertProject()
// ---------------------------------------------------------------------------

describe('upsertProject()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns { success: true, data } on success', async () => {
    const returnedRow = makeProjectRow({ id: 'new-id' });
    const builder = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: returnedRow, error: null }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await upsertProject({ title: 'New Project' } as Parameters<typeof upsertProject>[0]);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(returnedRow);
  });

  it('returns { success: false, error } on Supabase error', async () => {
    const builder = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'upsert failed' } }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await upsertProject({ title: 'Bad' } as Parameters<typeof upsertProject>[0]);
    expect(result.success).toBe(false);
    expect(result.error).toBe('upsert failed');
  });
});

// ---------------------------------------------------------------------------
// updateProjectFields()
// ---------------------------------------------------------------------------

describe('updateProjectFields()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns { success: true } on success', async () => {
    const builder = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await updateProjectFields('proj-id', { published: true });
    expect(result).toEqual({ success: true });
  });

  it('returns { success: false, error } on Supabase error', async () => {
    const builder = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'update failed' } }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await updateProjectFields('bad-id', { published: false });
    expect(result.success).toBe(false);
    expect(result.error).toBe('update failed');
  });
});

// ---------------------------------------------------------------------------
// deleteProject()
// ---------------------------------------------------------------------------

describe('deleteProject()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns { success: true } on success', async () => {
    const builder = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await deleteProject('proj-id');
    expect(result).toEqual({ success: true });
  });

  it('returns { success: false, error } on Supabase error', async () => {
    const builder = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'delete failed' } }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockServiceClient(() => builder));

    const result = await deleteProject('bad-id');
    expect(result.success).toBe(false);
    expect(result.error).toBe('delete failed');
  });
});
