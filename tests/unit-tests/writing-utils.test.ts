import { describe, it, expect } from 'vitest';
import {
  toWritingItem,
  mergeWriting,
  collectTopics,
  filterWriting,
  canonicalTopicsFor,
  filterByCanonicalTopic,
  type WritingSourceSummary,
} from '@/lib/writing-utils';

function summary(overrides: Partial<WritingSourceSummary> = {}): WritingSourceSummary {
  return {
    slug: 'a-post',
    title: 'A Post',
    description: 'Description',
    date: '2026-01-01',
    author: 'Tsholofelo Ndawonde',
    tags: ['Architecture'],
    readTime: '5 min',
    image: 'https://example.com/a.png',
    imageHint: 'hint',
    featured: false,
    topics: [],
    evergreen: false,
    relatedPostSlugs: [],
    relatedTutorialSlugs: [],
    relatedProjectSlugs: [],
    ...overrides,
  };
}

describe('toWritingItem()', () => {
  it('routes articles to /blog and tutorials to /tutorials', () => {
    expect(toWritingItem('article', summary({ slug: 'x' })).href).toBe('/blog/x');
    expect(toWritingItem('tutorial', summary({ slug: 'x' })).href).toBe('/tutorials/x');
  });

  it('defaults missing tags to an empty array', () => {
    const row = summary();
    // The DB column is nullable, so the mapper has to tolerate null.
    (row as { tags: string[] | null }).tags = null;
    expect(toWritingItem('article', row).tags).toEqual([]);
  });

  it('carries the featured flag through', () => {
    expect(toWritingItem('article', summary({ featured: true })).featured).toBe(true);
  });
});

describe('mergeWriting()', () => {
  it('interleaves both sources newest first', () => {
    const merged = mergeWriting(
      [summary({ slug: 'old-article', date: '2026-01-01' }), summary({ slug: 'new-article', date: '2026-06-01' })],
      [summary({ slug: 'mid-tutorial', date: '2026-03-01' })]
    );

    expect(merged.map((item) => item.slug)).toEqual([
      'new-article',
      'mid-tutorial',
      'old-article',
    ]);
    expect(merged.map((item) => item.type)).toEqual([
      'article',
      'tutorial',
      'article',
    ]);
  });

  it('handles either source being empty', () => {
    expect(mergeWriting([], [])).toEqual([]);
    expect(mergeWriting([summary()], [])).toHaveLength(1);
    expect(mergeWriting([], [summary()])).toHaveLength(1);
  });
});

describe('collectTopics()', () => {
  it('de-duplicates and sorts tags across both types', () => {
    const items = mergeWriting(
      [summary({ slug: 'a', tags: ['Security', 'Architecture'] })],
      [summary({ slug: 'b', tags: ['Architecture', '.NET'] })]
    );

    expect(collectTopics(items)).toEqual(['.NET', 'Architecture', 'Security']);
  });

  it('returns an empty list when nothing is tagged', () => {
    expect(collectTopics(mergeWriting([summary({ tags: [] })], []))).toEqual([]);
  });
});

describe('filterWriting()', () => {
  const items = mergeWriting(
    [
      summary({ slug: 'article-1', tags: ['Architecture'], date: '2026-05-01' }),
      summary({ slug: 'article-2', tags: ['Security'], date: '2026-04-01' }),
    ],
    [summary({ slug: 'tutorial-1', tags: ['Architecture'], date: '2026-03-01' })]
  );

  it('returns everything with no filters', () => {
    expect(filterWriting(items, {})).toHaveLength(3);
  });

  it('treats "all" as no type filter', () => {
    expect(filterWriting(items, { type: 'all' })).toHaveLength(3);
  });

  it('filters by type', () => {
    expect(filterWriting(items, { type: 'tutorial' }).map((i) => i.slug)).toEqual([
      'tutorial-1',
    ]);
  });

  it('filters by topic case-insensitively', () => {
    expect(filterWriting(items, { topic: 'architecture' }).map((i) => i.slug)).toEqual([
      'article-1',
      'tutorial-1',
    ]);
  });

  it('combines type and topic', () => {
    expect(
      filterWriting(items, { type: 'article', topic: 'Architecture' }).map((i) => i.slug)
    ).toEqual(['article-1']);
  });

  it('returns nothing for an unknown topic', () => {
    expect(filterWriting(items, { topic: 'quantum' })).toEqual([]);
  });
});


describe('canonicalTopicsFor()', () => {
  it('merges the curated topics column with topics implied by tags', () => {
    const [item] = mergeWriting(
      [summary({ topics: ['Security'], tags: ['Clean Architecture'] })],
      []
    );

    expect(canonicalTopicsFor(item).sort()).toEqual(['Architecture', 'Security']);
  });

  it('de-duplicates when a tag implies an already-curated topic', () => {
    const [item] = mergeWriting([summary({ topics: ['.NET'], tags: ['dotnet'] })], []);

    expect(canonicalTopicsFor(item)).toEqual(['.NET']);
  });

  it('ignores tags that are not canonical topics', () => {
    const [item] = mergeWriting(
      [summary({ topics: [], tags: ['Building in Public'] })],
      []
    );

    expect(canonicalTopicsFor(item)).toEqual([]);
  });
});

describe('filterByCanonicalTopic()', () => {
  const items = mergeWriting(
    [
      summary({ slug: 'curated', topics: ['Architecture'], tags: [], date: '2026-05-01' }),
      summary({ slug: 'via-tag', topics: [], tags: ['Distributed Systems'], date: '2026-04-01' }),
      summary({ slug: 'unrelated', topics: [], tags: ['Building in Public'], date: '2026-03-01' }),
    ],
    [summary({ slug: 'tutorial', topics: ['Architecture'], tags: [], date: '2026-02-01' })]
  );

  it('matches both curated topics and topics implied by tags', () => {
    // An item tagged only "Distributed Systems" must still appear under
    // Architecture, or the topic pages fragment.
    expect(filterByCanonicalTopic(items, 'Architecture').map((i) => i.slug)).toEqual([
      'curated',
      'via-tag',
      'tutorial',
    ]);
  });

  it('is case-insensitive', () => {
    expect(filterByCanonicalTopic(items, 'architecture')).toHaveLength(3);
  });

  it('returns nothing for a topic no item belongs to', () => {
    expect(filterByCanonicalTopic(items, 'Testing')).toEqual([]);
  });
});
