import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/writing', () => ({
  getAllWriting: vi.fn(),
}));

vi.mock('@/lib/projects', () => ({
  getProjects: vi.fn(),
}));

import { getAllWriting } from '@/lib/writing';
import { getProjects } from '@/lib/projects';
import { getRelatedContent } from '@/lib/related-content';
import type { WritingItem } from '@/lib/writing-utils';

const getAllWritingMock = vi.mocked(getAllWriting);
const getProjectsMock = vi.mocked(getProjects);

function writing(
  type: 'article' | 'tutorial',
  slug: string,
  overrides: Partial<WritingItem> = {}
): WritingItem {
  return {
    type,
    slug,
    href: type === 'article' ? `/blog/${slug}` : `/tutorials/${slug}`,
    title: slug,
    description: 'Description',
    date: '2026-01-01',
    author: 'Tsholofelo Ndawonde',
    tags: [],
    readTime: '5 min',
    image: '',
    imageHint: '',
    featured: false,
    topics: [],
    evergreen: false,
    relatedPostSlugs: [],
    relatedTutorialSlugs: [],
    relatedProjectSlugs: [],
    ...overrides,
  };
}

function project(slug: string, overrides: Record<string, unknown> = {}) {
  return {
    id: `id-${slug}`,
    slug,
    title: slug,
    description: 'Description',
    image: '',
    image_hint: '',
    tags: [],
    live_url: '',
    github_url: '',
    featured: false,
    published: true,
    category: 'personal',
    sort_order: 0,
    related_post_slugs: [],
    related_tutorial_slugs: [],
    related_project_slugs: [],
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  } as never;
}

describe('getRelatedContent()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllWritingMock.mockResolvedValue([]);
    getProjectsMock.mockResolvedValue([]);
  });

  it('resolves relations the subject itself declares (outgoing)', async () => {
    getAllWritingMock.mockResolvedValue([
      writing('article', 'why-i-built-it'),
      writing('tutorial', 'how-to-build-it'),
      writing('article', 'unrelated'),
    ]);
    getProjectsMock.mockResolvedValue([project('the-generator')]);

    const related = await getRelatedContent({
      kind: 'project',
      slug: 'the-generator',
      relatedPostSlugs: ['why-i-built-it'],
      relatedTutorialSlugs: ['how-to-build-it'],
    });

    expect(related.articles.map((a) => a.title)).toEqual(['why-i-built-it']);
    expect(related.tutorials.map((t) => t.title)).toEqual(['how-to-build-it']);
  });

  it('resolves relations declared on the other side (incoming)', async () => {
    // The article names the project; the project declares nothing. The link
    // must still show on the project page — that is the whole point of
    // resolving both directions.
    getAllWritingMock.mockResolvedValue([
      writing('article', 'why-i-built-it', {
        relatedProjectSlugs: ['the-generator'],
      }),
    ]);
    getProjectsMock.mockResolvedValue([project('the-generator')]);

    const related = await getRelatedContent({
      kind: 'project',
      slug: 'the-generator',
    });

    expect(related.articles.map((a) => a.title)).toEqual(['why-i-built-it']);
  });

  it('surfaces a project that names the subject article', async () => {
    getAllWritingMock.mockResolvedValue([writing('article', 'why-i-built-it')]);
    getProjectsMock.mockResolvedValue([
      project('the-generator', { related_post_slugs: ['why-i-built-it'] }),
    ]);

    const related = await getRelatedContent({
      kind: 'article',
      slug: 'why-i-built-it',
    });

    expect(related.projects.map((p) => p.title)).toEqual(['the-generator']);
    expect(related.projects[0].href).toBe('/projects/the-generator');
  });

  it('never links a piece to itself', async () => {
    getAllWritingMock.mockResolvedValue([
      writing('article', 'self', { relatedPostSlugs: ['self'] }),
    ]);

    const related = await getRelatedContent({
      kind: 'article',
      slug: 'self',
      relatedPostSlugs: ['self'],
    });

    expect(related.articles).toEqual([]);
  });

  it('does not confuse an article and a tutorial sharing a slug', async () => {
    getAllWritingMock.mockResolvedValue([
      writing('article', 'shared'),
      writing('tutorial', 'shared'),
    ]);

    const related = await getRelatedContent({
      kind: 'article',
      slug: 'shared',
      relatedTutorialSlugs: ['shared'],
    });

    // The article is the subject; the identically-slugged tutorial is not.
    expect(related.articles).toEqual([]);
    expect(related.tutorials.map((t) => t.href)).toEqual(['/tutorials/shared']);
  });

  it('falls back to the project uuid when it has no slug yet', async () => {
    // Before migration 0002 is applied, slug is undefined on every row.
    getProjectsMock.mockResolvedValue([project('', { slug: '' })]);

    const related = await getRelatedContent({
      kind: 'article',
      slug: 'x',
      relatedProjectSlugs: [''],
    });

    expect(related.projects[0]?.href).toBe('/projects/id-');
  });

  it('returns empty rather than throwing when a source fails', async () => {
    // Related content is an enhancement — it must never take a page down.
    getAllWritingMock.mockRejectedValue(new Error('Supabase is down'));

    const related = await getRelatedContent({ kind: 'article', slug: 'x' });

    expect(related).toEqual({ articles: [], tutorials: [], projects: [] });
  });

  it('returns empty when nothing is related', async () => {
    getAllWritingMock.mockResolvedValue([writing('article', 'other')]);
    getProjectsMock.mockResolvedValue([project('other-project')]);

    const related = await getRelatedContent({ kind: 'article', slug: 'x' });

    expect(related).toEqual({ articles: [], tutorials: [], projects: [] });
  });
});
