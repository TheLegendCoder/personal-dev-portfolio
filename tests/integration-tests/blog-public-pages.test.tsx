import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/lib/blog', () => ({
  getBlogPostsSummary: vi.fn(),
  getBlogPost: vi.fn(),
}));

vi.mock('@/components/layout/layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

vi.mock('@/components/blog/blogcard', () => ({
  BlogCard: ({ id, title, excerpt, category }: { id: string; title: string; excerpt: string; category: string }) => (
    <article data-testid="blog-card" data-slug={id}>
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

vi.mock('@/components/blog/share-buttons', () => ({
  default: ({ title, url, type }: { title: string; url: string; type: string }) => (
    <div data-testid="share-buttons">
      {title}|{url}|{type}
    </div>
  ),
}));

vi.mock('@/lib/seo/metadata', () => ({
  generateSEOMetadata: vi.fn((input: Record<string, unknown>) => ({
    kind: 'seo',
    ...input,
  })),
  getCanonicalUrl: vi.fn((path: string) => `https://portfolio.test${path}`),
}));

vi.mock('@/lib/seo/breadcrumbs', () => ({
  generateBreadcrumbs: vi.fn(() => [{ name: 'Home' }, { name: 'Blog' }]),
  generateBlogPostBreadcrumbs: vi.fn((title: string) => [{ name: 'Blog' }, { name: title }]),
}));

vi.mock('@/lib/seo/structured-data', () => ({
  generateBlogPostingSchema: vi.fn((input: Record<string, unknown>) => ({
    '@type': 'BlogPosting',
    ...input,
  })),
  generateJSONLD: vi.fn((input: Record<string, unknown>) => JSON.stringify(input)),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
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
  ArrowLeft: () => <svg data-testid="arrow-left" />,
}));

vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: vi.fn((value: string) => value),
  },
}));

vi.mock('highlight.js/styles/atom-one-dark.css', () => ({}));

import BlogPage, { metadata } from '@/app/blog/page';
import BlogPostPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/blog/[slug]/page';
import { getBlogPost, getBlogPostsSummary } from '@/lib/blog';
import { notFound } from 'next/navigation';

const sampleSummaries = [
  {
    slug: 'first-post',
    title: 'First Post',
    description: 'First description',
    date: '2026-05-01',
    author: 'Author One',
    tags: ['React'],
    readTime: '4 min read',
    published: true,
    featured: true,
    image: 'https://images.test/first.png',
    imageHint: 'first image',
  },
  {
    slug: 'second-post',
    title: 'Second Post',
    description: 'Second description',
    date: '2026-05-02',
    author: 'Author Two',
    tags: ['TypeScript'],
    readTime: '6 min read',
    published: true,
    featured: false,
    image: 'https://images.test/second.png',
    imageHint: 'second image',
  },
];

const samplePost = {
  slug: 'first-post',
  title: 'First Post',
  description: 'First description',
  date: '2026-05-01',
  author: 'Author One',
  tags: ['React', 'Testing'],
  readTime: '4 min read',
  published: true,
  featured: true,
  image: 'https://images.test/first.png',
  imageHint: 'first image',
  content: '<p>Rendered HTML content</p>',
};

describe('blog public page integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders blog cards when posts exist', async () => {
    vi.mocked(getBlogPostsSummary).mockResolvedValue(sampleSummaries);

    const html = renderToStaticMarkup(await BlogPage());

    expect(html).toContain('First Post');
    expect(html).toContain('Second Post');
    expect(html).toContain('First description');
    expect(html).toContain('React');
    expect(html.match(/data-testid="blog-card"/g)).toHaveLength(2);
  });

  it('renders the empty state when no posts exist', async () => {
    vi.mocked(getBlogPostsSummary).mockResolvedValue([]);

    const html = renderToStaticMarkup(await BlogPage());

    expect(html).toContain('Blog posts coming soon');
    expect(html).toContain('Check back soon');
    expect(html).toContain('Home &gt; Blog');
  });

  it('keeps the blog listing metadata export available', () => {
    expect(metadata).toEqual(
      expect.objectContaining({
        kind: 'seo',
        title: 'Blog',
        canonicalUrl: 'https://portfolio.test/blog',
      })
    );
  });
});

describe('blog detail page integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateStaticParams returns slugs from the public summary API', async () => {
    vi.mocked(getBlogPostsSummary).mockResolvedValue(sampleSummaries);

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: 'first-post' },
      { slug: 'second-post' },
    ]);
  });

  it('generateMetadata returns SEO metadata for an existing post', async () => {
    vi.mocked(getBlogPost).mockResolvedValue(samplePost);

    const result = await generateMetadata({
      params: Promise.resolve({ slug: 'first-post' }),
    });

    expect(result).toEqual(
      expect.objectContaining({
        kind: 'seo',
        title: 'First Post',
        description: 'First description',
        canonicalUrl: 'https://portfolio.test/blog/first-post',
      })
    );
  });

  it('generateMetadata returns a not-found metadata payload when the post is missing', async () => {
    vi.mocked(getBlogPost).mockResolvedValue(null);

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: 'missing-post' }) })
    ).resolves.toEqual({
      title: 'Post Not Found',
      description: "The blog post you're looking for doesn't exist.",
    });
  });

  it('renders the found post title, description, tags, and share buttons', async () => {
    vi.mocked(getBlogPost).mockResolvedValue(samplePost);

    const html = renderToStaticMarkup(
      await BlogPostPage({ params: Promise.resolve({ slug: 'first-post' }) })
    );

    expect(html).toContain('First Post');
    expect(html).toContain('First description');
    expect(html).toContain('Rendered HTML content');
    expect(html).toContain('#React');
    expect(html).toContain('#Testing');
    expect(html).toContain('First Post|https://portfolio.test/blog/first-post|blog');
  });

  it('calls notFound when the requested post is missing', async () => {
    vi.mocked(getBlogPost).mockResolvedValue(null);

    await expect(
      BlogPostPage({ params: Promise.resolve({ slug: 'missing-post' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});