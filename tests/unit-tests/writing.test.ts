import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/blog', () => ({
  getBlogPostsSummary: vi.fn(),
}));

vi.mock('@/lib/tutorial', () => ({
  getTutorialsSummary: vi.fn(),
}));

import { getBlogPostsSummary } from '@/lib/blog';
import { getTutorialsSummary } from '@/lib/tutorial';
import { getAllWriting, getFeaturedWriting, getWritingTopics } from '@/lib/writing';

const getBlogPostsSummaryMock = vi.mocked(getBlogPostsSummary);
const getTutorialsSummaryMock = vi.mocked(getTutorialsSummary);

function row(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'a-post',
    title: 'A Post',
    description: 'Description',
    date: '2026-01-01',
    author: 'Tsholofelo Ndawonde',
    tags: ['Architecture'],
    readTime: '5 min',
    published: true,
    featured: false,
    image: 'https://example.com/a.png',
    imageHint: 'hint',
    ...overrides,
  } as never;
}

describe('writing data layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBlogPostsSummaryMock.mockResolvedValue([]);
    getTutorialsSummaryMock.mockResolvedValue([]);
  });

  describe('getAllWriting()', () => {
    it('merges both sources into one date-sorted stream', async () => {
      getBlogPostsSummaryMock.mockResolvedValue([
        row({ slug: 'article-old', date: '2026-01-01' }),
        row({ slug: 'article-new', date: '2026-09-01' }),
      ]);
      getTutorialsSummaryMock.mockResolvedValue([
        row({ slug: 'tutorial-mid', date: '2026-05-01' }),
      ]);

      const all = await getAllWriting();

      expect(all.map((item) => item.slug)).toEqual([
        'article-new',
        'tutorial-mid',
        'article-old',
      ]);
    });

    it('tags each item with its type and canonical href', async () => {
      getBlogPostsSummaryMock.mockResolvedValue([row({ slug: 'post' })]);
      getTutorialsSummaryMock.mockResolvedValue([row({ slug: 'guide' })]);

      const all = await getAllWriting();
      const byType = Object.fromEntries(all.map((item) => [item.type, item.href]));

      // /blog and /tutorials remain the canonical URLs — /writing is a hub only.
      expect(byType).toEqual({
        article: '/blog/post',
        tutorial: '/tutorials/guide',
      });
    });

    it('returns an empty stream when nothing is published', async () => {
      expect(await getAllWriting()).toEqual([]);
    });
  });

  describe('getFeaturedWriting()', () => {
    it('returns only items flagged featured, across both types', async () => {
      getBlogPostsSummaryMock.mockResolvedValue([
        row({ slug: 'plain', featured: false }),
        row({ slug: 'starred', featured: true, date: '2026-02-01' }),
      ]);
      getTutorialsSummaryMock.mockResolvedValue([
        row({ slug: 'starred-guide', featured: true, date: '2026-03-01' }),
      ]);

      const featured = await getFeaturedWriting();

      expect(featured.map((item) => item.slug)).toEqual([
        'starred-guide',
        'starred',
      ]);
    });

    it('respects the limit', async () => {
      getBlogPostsSummaryMock.mockResolvedValue([
        row({ slug: 'a', featured: true, date: '2026-03-01' }),
        row({ slug: 'b', featured: true, date: '2026-02-01' }),
        row({ slug: 'c', featured: true, date: '2026-01-01' }),
      ]);

      expect(await getFeaturedWriting(2)).toHaveLength(2);
    });

    it('does not fall back to recent posts when nothing is featured', async () => {
      // Deliberately unlike getTopBlogPosts: the hub renders Latest directly
      // below Featured, so a fallback would print the same cards twice.
      getBlogPostsSummaryMock.mockResolvedValue([row({ featured: false })]);

      expect(await getFeaturedWriting()).toEqual([]);
    });
  });

  describe('getWritingTopics()', () => {
    it('collects distinct tags from both sources, sorted', async () => {
      getBlogPostsSummaryMock.mockResolvedValue([
        row({ slug: 'a', tags: ['Security', 'Architecture'] }),
      ]);
      getTutorialsSummaryMock.mockResolvedValue([
        row({ slug: 'b', tags: ['Architecture', '.NET'] }),
      ]);

      expect(await getWritingTopics()).toEqual(['.NET', 'Architecture', 'Security']);
    });

    it('returns an empty list when nothing is tagged', async () => {
      getBlogPostsSummaryMock.mockResolvedValue([row({ tags: [] })]);

      expect(await getWritingTopics()).toEqual([]);
    });
  });
});
