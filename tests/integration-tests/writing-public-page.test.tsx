import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/lib/writing', async () => {
  const actual = await vi.importActual<typeof import('@/lib/writing')>('@/lib/writing');
  return {
    ...actual,
    getUnifiedWriting: vi.fn(),
  };
});

vi.mock('@/components/layout/layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

vi.mock('@/components/blog/blogcard', () => ({
  BlogCard: ({ id, title, excerpt, category, large }: { id: string; title: string; excerpt: string; category: string; large?: boolean }) => (
    <article data-testid="blog-card" data-slug={id} data-large={large ? 'true' : 'false'}>
      <h2>{title}</h2>
      <p>{excerpt}</p>
      <span>{category}</span>
    </article>
  ),
}));

vi.mock('@/components/tutorial/tutorialcard', () => ({
  TutorialCard: ({ id, title, excerpt, category, large }: { id: string; title: string; excerpt: string; category: string; large?: boolean }) => (
    <article data-testid="tutorial-card" data-slug={id} data-large={large ? 'true' : 'false'}>
      <h2>{title}</h2>
      <p>{excerpt}</p>
      <span>{category}</span>
    </article>
  ),
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({ title, description, actionText }: { title: string; description: string; actionText: string }) => (
    <section data-testid="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      <span>{actionText}</span>
    </section>
  ),
}));

vi.mock('@/components/ui/breadcrumb', () => ({
  BreadcrumbWithSchema: ({ items, className }: { items: Array<{ name: string }>; className?: string }) => (
    <nav data-testid="breadcrumbs" data-class-name={className ?? ''}>
      {items.map((item) => item.name).join(' > ')}
    </nav>
  ),
}));

vi.mock('@/lib/seo/metadata', () => ({
  generateSEOMetadata: vi.fn((input: Record<string, unknown>) => ({ kind: 'seo', ...input })),
  getCanonicalUrl: vi.fn((path: string) => `https://portfolio.test${path}`),
}));

vi.mock('@/lib/seo/breadcrumbs', () => ({
  generateBreadcrumbs: vi.fn(() => [{ name: 'Home' }, { name: 'Writing' }]),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('lucide-react', () => ({
  BookOpen: () => <svg data-testid="book-open" />,
}));

import WritingPage, { metadata } from '@/app/writing/page';
import { getUnifiedWriting } from '@/lib/writing';
import type { WritingItem } from '@/lib/writing';

function item(overrides: Partial<WritingItem> & Pick<WritingItem, 'slug' | 'type'>): WritingItem {
  return {
    title: `Title ${overrides.slug}`,
    description: `Description ${overrides.slug}`,
    date: '2026-05-01',
    author: 'Author',
    tags: ['React'],
    readTime: '4 min read',
    published: true,
    featured: false,
    image: 'https://images.test/cover.png',
    imageHint: 'cover',
    ...overrides,
  } as WritingItem;
}

const article = item({ slug: 'an-article', type: 'article', date: '2026-05-02' });
const tutorial = item({ slug: 'a-tutorial', type: 'tutorial', date: '2026-05-01' });
const featuredArticle = item({
  slug: 'featured-article',
  type: 'article',
  date: '2026-04-01',
  featured: true,
});

const render = (items: WritingItem[], type?: string) => {
  vi.mocked(getUnifiedWriting).mockResolvedValue(items);
  return WritingPage({ searchParams: Promise.resolve({ type }) }).then(renderToStaticMarkup);
};

describe('writing index page integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders articles and tutorials with the right card for each type', async () => {
    const html = await render([article, tutorial]);

    expect(html.match(/data-testid="blog-card"/g)).toHaveLength(1);
    expect(html.match(/data-testid="tutorial-card"/g)).toHaveLength(1);
    expect(html).toContain('Title an-article');
    expect(html).toContain('Title a-tutorial');
  });

  it('labels cards by type rather than by first tag', async () => {
    const html = await render([article, tutorial]);

    expect(html).toContain('<span>Article</span>');
    expect(html).toContain('<span>Tutorial</span>');
    expect(html).not.toContain('<span>React</span>');
  });

  it('filters to articles when ?type=articles', async () => {
    const html = await render([article, tutorial], 'articles');

    expect(html).toContain('Title an-article');
    expect(html).not.toContain('Title a-tutorial');
  });

  it('filters to tutorials when ?type=tutorials', async () => {
    const html = await render([article, tutorial], 'tutorials');

    expect(html).toContain('Title a-tutorial');
    expect(html).not.toContain('Title an-article');
  });

  it('falls back to the full list for an unrecognised ?type=', async () => {
    const html = await render([article, tutorial], 'nonsense');

    expect(html).toContain('Title an-article');
    expect(html).toContain('Title a-tutorial');
  });

  it('pins featured items above the chronological list', async () => {
    const html = await render([article, tutorial, featuredArticle]);

    expect(html).toContain('Featured');
    // The featured item is older but must still appear before the newer ones.
    expect(html.indexOf('Title featured-article')).toBeLessThan(html.indexOf('Title an-article'));
  });

  it('renders the empty state when nothing is published', async () => {
    const html = await render([]);

    expect(html).toContain('data-testid="empty-state"');
    expect(html).toContain('Nothing here yet');
    expect(html).toContain('Home &gt; Writing');
  });

  it('exports canonical /writing metadata', () => {
    expect(metadata).toEqual(
      expect.objectContaining({
        kind: 'seo',
        title: 'Writing',
        canonicalUrl: 'https://portfolio.test/writing',
      })
    );
  });
});
