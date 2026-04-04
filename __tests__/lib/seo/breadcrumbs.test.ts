import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateBreadcrumbs, generateBlogPostBreadcrumbs } from '@/lib/seo/breadcrumbs';
import * as metadata from '@/lib/seo/metadata';

describe('breadcrumbs', () => {
  const MOCK_SITE_URL = 'https://example.com';

  beforeEach(() => {
    vi.spyOn(metadata, 'getSiteUrl').mockReturnValue(MOCK_SITE_URL);
  });

  describe('generateBreadcrumbs', () => {
    it('should generate just the Home breadcrumb for the root path', () => {
      const result = generateBreadcrumbs('/');
      expect(result).toEqual([
        { name: 'Home', url: MOCK_SITE_URL },
      ]);
    });

    it('should generate breadcrumbs for a simple path', () => {
      const result = generateBreadcrumbs('/about');
      expect(result).toEqual([
        { name: 'Home', url: MOCK_SITE_URL },
        { name: 'About', url: `${MOCK_SITE_URL}/about` },
      ]);
    });

    it('should generate breadcrumbs for a nested path', () => {
      const result = generateBreadcrumbs('/blog/tech/react');
      expect(result).toEqual([
        { name: 'Home', url: MOCK_SITE_URL },
        { name: 'Blog', url: `${MOCK_SITE_URL}/blog` },
        { name: 'Tech', url: `${MOCK_SITE_URL}/blog/tech` },
        { name: 'React', url: `${MOCK_SITE_URL}/blog/tech/react` },
      ]);
    });

    it('should format hyphenated segments correctly', () => {
      const result = generateBreadcrumbs('/about-us/our-team');
      expect(result).toEqual([
        { name: 'Home', url: MOCK_SITE_URL },
        { name: 'About Us', url: `${MOCK_SITE_URL}/about-us` },
        { name: 'Our Team', url: `${MOCK_SITE_URL}/about-us/our-team` },
      ]);
    });

    it('should use custom labels when provided', () => {
      const result = generateBreadcrumbs('/products/123-abc/reviews', {
        '123-abc': 'Awesome Product',
      });
      expect(result).toEqual([
        { name: 'Home', url: MOCK_SITE_URL },
        { name: 'Products', url: `${MOCK_SITE_URL}/products` },
        { name: 'Awesome Product', url: `${MOCK_SITE_URL}/products/123-abc` },
        { name: 'Reviews', url: `${MOCK_SITE_URL}/products/123-abc/reviews` },
      ]);
    });

    it('should ignore empty segments caused by consecutive slashes', () => {
      const result = generateBreadcrumbs('//blog///post/');
      expect(result).toEqual([
        { name: 'Home', url: MOCK_SITE_URL },
        { name: 'Blog', url: `${MOCK_SITE_URL}/blog` },
        { name: 'Post', url: `${MOCK_SITE_URL}/blog/post` },
      ]);
    });
  });

  describe('generateBlogPostBreadcrumbs', () => {
    it('should generate breadcrumbs specifically for a blog post', () => {
      const result = generateBlogPostBreadcrumbs('My Awesome Post');
      expect(result).toEqual([
        { name: 'Blog', url: `${MOCK_SITE_URL}/blog` },
        { name: 'My Awesome Post', url: '' },
      ]);
    });
  });
});
