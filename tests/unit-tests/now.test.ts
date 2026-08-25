import { describe, it, expect } from 'vitest';
import { getNowContent, parseNowSections, parseNowUpdated } from '@/lib/now';

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

  it('returns an empty list when frontmatter is missing or not an array', () => {
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
  it('accepts the Date that YAML produces for an unquoted date', () => {
    const result = parseNowUpdated(new Date('2026-08-25T00:00:00Z'));
    expect(result).toBe('2026-08-25T00:00:00.000Z');
  });

  it('accepts a quoted date string', () => {
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


describe('getNowContent()', () => {
  it('reads and parses the checked-in src/content/now.md', async () => {
    // The file ships with the repo rather than living in Supabase, so this
    // also guards against it being moved or its frontmatter being broken.
    const now = await getNowContent();

    expect(now.updated).not.toBeNull();
    expect(now.sections.length).toBeGreaterThan(0);
    now.sections.forEach((section) => {
      expect(typeof section.heading).toBe('string');
      expect(Array.isArray(section.items)).toBe(true);
    });
  });

  it('renders the markdown body below the frontmatter to HTML', async () => {
    const now = await getNowContent();

    expect(now.body).toContain('<p>');
  });
});
