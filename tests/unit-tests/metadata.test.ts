import { describe, it, expect } from 'vitest';
import {
  generateSEOMetadata,
  getCanonicalUrl,
  getSiteName,
  getSiteUrl,
} from '@/lib/seo/metadata';

describe('seo metadata helpers', () => {
  it('generateSEOMetadata returns defaults when no props are provided', () => {
    const metadata = generateSEOMetadata({});

    expect(metadata.title).toBe('Tsholofelo Ndawonde | Software Engineer');
    expect(metadata.description).toContain('Software engineer documenting learnings');
    expect(metadata.alternates?.canonical).toBe(getSiteUrl());
    expect(metadata.openGraph?.siteName).toBe(getSiteName());
    expect(metadata.robots).toEqual(
      expect.objectContaining({
        index: true,
        follow: true,
      }),
    );
  });

  it('generateSEOMetadata maps article-specific fields', () => {
    const metadata = generateSEOMetadata({
      title: 'Deep Dive',
      description: 'Article description',
      type: 'article',
      publishedTime: '2026-05-01T12:00:00Z',
      authors: ['Tsholofelo'],
      tags: ['nextjs', 'testing'],
      canonicalUrl: 'https://tsholofelondawonde.co.za/blog/deep-dive',
      image: 'https://example.com/og.jpg',
      imageAlt: 'Deep Dive OG image',
    });

    expect(metadata.title).toBe('Deep Dive | Tsholofelo Ndawonde');
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        type: 'article',
        url: 'https://tsholofelondawonde.co.za/blog/deep-dive',
        publishedTime: '2026-05-01T12:00:00Z',
        authors: ['Tsholofelo'],
        tags: ['nextjs', 'testing'],
      }),
    );

    expect(metadata.openGraph?.images?.[0]).toEqual(
      expect.objectContaining({
        url: 'https://example.com/og.jpg',
        alt: 'Deep Dive OG image',
      }),
    );
  });

  it('generateSEOMetadata sets noindex robots when requested', () => {
    const metadata = generateSEOMetadata({ noIndex: true });

    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it('getCanonicalUrl normalizes path with leading slash', () => {
    const canonical = getCanonicalUrl('blog/post-1');
    expect(canonical).toBe(`${getSiteUrl()}/blog/post-1`);
  });

  it('getCanonicalUrl preserves paths that already start with slash', () => {
    const canonical = getCanonicalUrl('/projects');
    expect(canonical).toBe(`${getSiteUrl()}/projects`);
  });
});
