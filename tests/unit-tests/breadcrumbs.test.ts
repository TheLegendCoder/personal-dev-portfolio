import { describe, it, expect, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/seo/metadata', () => ({
  getSiteUrl: vi.fn(() => 'https://example.com'),
}));

import {
  generateBreadcrumbs,
  generateBlogPostBreadcrumbs,
  generateTutorialBreadcrumbs,
} from '@/lib/seo/breadcrumbs';

// ---------------------------------------------------------------------------
// generateBreadcrumbs()
// ---------------------------------------------------------------------------

describe('generateBreadcrumbs()', () => {
  it('always includes Home as the first item pointing to site root', () => {
    const crumbs = generateBreadcrumbs('/blog');

    expect(crumbs[0].name).toBe('Home');
    expect(crumbs[0].url).toBe('https://example.com');
  });

  it('adds one item per path segment after Home', () => {
    const crumbs = generateBreadcrumbs('/blog/my-post');

    // Home + blog + my-post = 3
    expect(crumbs).toHaveLength(3);
  });

  it('formats hyphenated segments to Title Case', () => {
    const crumbs = generateBreadcrumbs('/my-cool-page');

    expect(crumbs[1].name).toBe('My Cool Page');
  });

  it('capitalises single-word segments', () => {
    const crumbs = generateBreadcrumbs('/blog');

    expect(crumbs[1].name).toBe('Blog');
  });

  it('builds correct full URL for each segment', () => {
    const crumbs = generateBreadcrumbs('/blog/my-post');

    expect(crumbs[1].url).toBe('https://example.com/blog');
    expect(crumbs[2].url).toBe('https://example.com/blog/my-post');
  });

  it('applies custom labels when provided', () => {
    const crumbs = generateBreadcrumbs('/blog/some-slug', {
      'some-slug': 'My Custom Post Title',
    });

    expect(crumbs[2].name).toBe('My Custom Post Title');
  });

  it('falls back to formatted segment name when no custom label matches', () => {
    const crumbs = generateBreadcrumbs('/blog/some-slug', {
      'other-key': 'Not Used',
    });

    expect(crumbs[2].name).toBe('Some Slug');
  });

  it('handles a root path with no segments (only Home)', () => {
    const crumbs = generateBreadcrumbs('/');

    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].name).toBe('Home');
  });

  it('handles deeply nested paths', () => {
    const crumbs = generateBreadcrumbs('/a/b/c/d');

    expect(crumbs).toHaveLength(5); // Home + 4 segments
    expect(crumbs[4].url).toBe('https://example.com/a/b/c/d');
  });
});

// ---------------------------------------------------------------------------
// generateBlogPostBreadcrumbs()
// ---------------------------------------------------------------------------

describe('generateBlogPostBreadcrumbs()', () => {
  it('returns Home > Blog > Title', () => {
    const crumbs = generateBlogPostBreadcrumbs('My Awesome Post');

    // The Home crumb was added so detail pages agree with generateBreadcrumbs;
    // the two previously emitted different BreadcrumbList shapes.
    expect(crumbs).toHaveLength(3);
    expect(crumbs.map((c) => c.name)).toEqual(['Home', 'Blog', 'My Awesome Post']);
  });

  it('links Home and the section, leaving the current page url empty', () => {
    const crumbs = generateBlogPostBreadcrumbs('My Awesome Post');

    expect(crumbs[0].url).toBe('https://example.com');
    expect(crumbs[1].url).toBe('https://example.com/blog');
    expect(crumbs[2].url).toBe('');
  });
});

// ---------------------------------------------------------------------------
// generateTutorialBreadcrumbs()
// ---------------------------------------------------------------------------

describe('generateTutorialBreadcrumbs()', () => {
  it('returns Home > Tutorials > Title', () => {
    const crumbs = generateTutorialBreadcrumbs('My Guide');

    // Tutorial pages previously reused generateBlogPostBreadcrumbs and so
    // rendered a trail labelled "Blog".
    expect(crumbs.map((c) => c.name)).toEqual(['Home', 'Tutorials', 'My Guide']);
    expect(crumbs[1].url).toBe('https://example.com/tutorials');
    expect(crumbs[2].url).toBe('');
  });
});
