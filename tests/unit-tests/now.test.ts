import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — must come before importing the module under test
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase/server', () => ({
  createAnonClient: vi.fn(),
  createServiceClient: vi.fn(),
}));

vi.mock('@/lib/markdown', () => ({
  markdownToHtml: vi.fn(async (content: string) => `<p>${content}</p>`),
}));

import { parseNowSections, parseNowUpdated } from '@/lib/now-utils';
import { getNowContent, getNowAdmin, updateNow } from '@/lib/now';
import { createAnonClient, createServiceClient } from '@/lib/supabase/server';
import { markdownToHtml } from '@/lib/markdown';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    then: (resolve: (v: typeof result) => void) => Promise.resolve(result).then(resolve),
  };
}

function makeMockClient(from: (table: string) => unknown) {
  return { from } as unknown as ReturnType<typeof createAnonClient>;
}

const DB_ROW = {
  body: 'This is a [now page](https://nownownow.com/about).',
  sections: [
    { heading: 'Building', items: ['One', 'Two'] },
    { heading: 'Learning', items: ['Three'] },
  ],
  updated_at: '2026-08-25 00:00:00+00',
};

// ---------------------------------------------------------------------------
// Pure helpers (moved from src/lib/now.ts to src/lib/now-utils.ts)
// ---------------------------------------------------------------------------

describe('parseNowSections()', () => {
  it('keeps well-formed sections', () => {
    expect(
      parseNowSections([
        { heading: 'Building', items: ['One', 'Two'] },
        { heading: 'Learning', items: ['Three'] },
      ])
    ).toEqual([
      { heading: 'Building', items: ['One', 'Two'] },
      { heading: 'Learning', items: ['Three'] },
    ]);
  });

  it('returns an empty list when the value is missing or not an array', () => {
    expect(parseNowSections(undefined)).toEqual([]);
    expect(parseNowSections(null)).toEqual([]);
    expect(parseNowSections('Building')).toEqual([]);
    expect(parseNowSections({ heading: 'Building' })).toEqual([]);
  });

  it('drops entries without a usable heading', () => {
    expect(
      parseNowSections([
        { items: ['orphan'] },
        { heading: '   ', items: ['blank'] },
        null,
        'nope',
        { heading: 'Valid', items: ['kept'] },
      ])
    ).toEqual([{ heading: 'Valid', items: ['kept'] }]);
  });

  it('tolerates a section with no items', () => {
    expect(parseNowSections([{ heading: 'Exploring' }])).toEqual([
      { heading: 'Exploring', items: [] },
    ]);
  });

  it('drops non-string and blank items', () => {
    expect(
      parseNowSections([{ heading: 'Writing', items: ['ok', '', 42, null, '  '] }])
    ).toEqual([{ heading: 'Writing', items: ['ok'] }]);
  });
});

describe('parseNowUpdated()', () => {
  it('accepts the Date a driver may produce', () => {
    expect(parseNowUpdated(new Date('2026-08-25T00:00:00Z'))).toBe('2026-08-25T00:00:00.000Z');
  });

  it('accepts a date string', () => {
    expect(parseNowUpdated('2026-08-25')).toBe('2026-08-25T00:00:00.000Z');
  });

  it('returns null for missing or unparseable values', () => {
    expect(parseNowUpdated(undefined)).toBeNull();
    expect(parseNowUpdated(null)).toBeNull();
    expect(parseNowUpdated('not a date')).toBeNull();
    expect(parseNowUpdated(new Date('nonsense'))).toBeNull();
    expect(parseNowUpdated(12345)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getNowContent() — public read
// ---------------------------------------------------------------------------

describe('getNowContent()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps a DB row and renders the body markdown to HTML', async () => {
    const builder = makeQueryBuilder({ data: DB_ROW, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockClient(() => builder));

    const now = await getNowContent();

    expect(markdownToHtml).toHaveBeenCalledWith(DB_ROW.body);
    expect(now.body).toBe(`<p>${DB_ROW.body}</p>`);
    expect(now.updated).toBe('2026-08-25T00:00:00.000Z');
    expect(now.sections).toEqual(DB_ROW.sections);
  });

  it('does not render an empty body', async () => {
    const builder = makeQueryBuilder({ data: { ...DB_ROW, body: '   ' }, error: null });
    vi.mocked(createAnonClient).mockReturnValue(makeMockClient(() => builder));

    const now = await getNowContent();

    expect(markdownToHtml).not.toHaveBeenCalled();
    expect(now.body).toBe('');
  });

  it('returns an empty NowContent when Supabase reports an error', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'relation does not exist' } });
    vi.mocked(createAnonClient).mockReturnValue(makeMockClient(() => builder));

    expect(await getNowContent()).toEqual({ updated: null, sections: [], body: '' });
  });

  it('returns an empty NowContent when createAnonClient throws', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(createAnonClient).mockImplementation(() => {
      throw new Error('no anon client');
    });

    expect(await getNowContent()).toEqual({ updated: null, sections: [], body: '' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// getNowAdmin() — raw read
// ---------------------------------------------------------------------------

describe('getNowAdmin()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the raw body without rendering markdown', async () => {
    const builder = makeQueryBuilder({ data: DB_ROW, error: null });
    vi.mocked(createServiceClient).mockReturnValue(makeMockClient(() => builder));

    const now = await getNowAdmin();

    expect(markdownToHtml).not.toHaveBeenCalled();
    expect(now.body).toBe(DB_ROW.body);
    expect(now.sections).toEqual(DB_ROW.sections);
    expect(now.updated).toBe('2026-08-25T00:00:00.000Z');
  });

  it('returns empty defaults on Supabase error', async () => {
    const builder = makeQueryBuilder({ data: null, error: { message: 'boom' } });
    vi.mocked(createServiceClient).mockReturnValue(makeMockClient(() => builder));

    expect(await getNowAdmin()).toEqual({ body: '', sections: [], updated: null });
  });

  it('returns empty defaults when createServiceClient throws', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(createServiceClient).mockImplementation(() => {
      throw new Error('no service client');
    });

    expect(await getNowAdmin()).toEqual({ body: '', sections: [], updated: null });
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// updateNow()
// ---------------------------------------------------------------------------

describe('updateNow()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns { success: true } and stamps updated_at on success', async () => {
    const builder = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockClient(() => builder));

    const result = await updateNow({ body: 'hi', sections: [{ heading: 'H', items: ['a'] }] });

    expect(result).toEqual({ success: true });
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'hi',
        sections: [{ heading: 'H', items: ['a'] }],
        updated_at: expect.any(String),
      })
    );
    expect(builder.eq).toHaveBeenCalledWith('id', 1);
  });

  it('returns { success: false, error } on Supabase error', async () => {
    const builder = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'update failed' } }),
    };
    vi.mocked(createServiceClient).mockReturnValue(makeMockClient(() => builder));

    const result = await updateNow({ body: '', sections: [] });
    expect(result.success).toBe(false);
    expect(result.error).toBe('update failed');
  });

  it('returns { success: false, error } when createServiceClient throws', async () => {
    vi.mocked(createServiceClient).mockImplementation(() => {
      throw new Error('service client unavailable');
    });

    const result = await updateNow({ body: '', sections: [] });
    expect(result.success).toBe(false);
    expect(result.error).toContain('service client unavailable');
  });
});
