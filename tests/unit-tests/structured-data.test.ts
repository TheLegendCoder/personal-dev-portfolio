import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/seo/metadata', () => ({
  getSiteUrl: vi.fn(() => 'https://example.com'),
  getSiteName: vi.fn(() => 'Example Site'),
}));

import {
  generateOrganizationSchema,
  generatePersonSchema,
  generateWebsiteSchema,
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
  generateJSONLD,
} from '@/lib/seo/structured-data';

// ---------------------------------------------------------------------------
// generateOrganizationSchema()
// ---------------------------------------------------------------------------

describe('generateOrganizationSchema()', () => {
  it('returns the correct @type and @context', () => {
    const schema = generateOrganizationSchema({
      name: 'Acme Inc',
      description: 'A company',
      url: 'https://acme.com',
      socialLinks: {},
    });

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
  });

  it('maps name, description, and url', () => {
    const schema = generateOrganizationSchema({
      name: 'Acme Inc',
      description: 'A company',
      url: 'https://acme.com',
      socialLinks: {},
    });

    expect(schema.name).toBe('Acme Inc');
    expect(schema.description).toBe('A company');
    expect(schema.url).toBe('https://acme.com');
  });

  it('includes email when provided', () => {
    const schema = generateOrganizationSchema({
      name: 'Acme Inc',
      description: 'A company',
      url: 'https://acme.com',
      email: 'hello@acme.com',
      socialLinks: {},
    }) as Record<string, unknown>;

    expect(schema['email']).toBe('hello@acme.com');
  });

  it('omits email when not provided', () => {
    const schema = generateOrganizationSchema({
      name: 'Acme Inc',
      description: 'A company',
      url: 'https://acme.com',
      socialLinks: {},
    }) as Record<string, unknown>;

    expect('email' in schema).toBe(false);
  });

  it('includes sameAs array with truthy social links', () => {
    const schema = generateOrganizationSchema({
      name: 'Acme Inc',
      description: 'A company',
      url: 'https://acme.com',
      socialLinks: {
        github: 'https://github.com/acme',
        linkedin: 'https://linkedin.com/company/acme',
        twitter: undefined,
      },
    }) as Record<string, unknown>;

    expect(Array.isArray(schema['sameAs'])).toBe(true);
    expect(schema['sameAs']).toHaveLength(2);
    expect(schema['sameAs']).toContain('https://github.com/acme');
  });

  it('omits sameAs when all social links are falsy', () => {
    const schema = generateOrganizationSchema({
      name: 'Acme Inc',
      description: 'A company',
      url: 'https://acme.com',
      socialLinks: {},
    }) as Record<string, unknown>;

    expect('sameAs' in schema).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generatePersonSchema()
// ---------------------------------------------------------------------------

describe('generatePersonSchema()', () => {
  it('returns @type Person', () => {
    const schema = generatePersonSchema({
      name: 'Jane Doe',
      jobTitle: 'Engineer',
      description: 'A developer',
      url: 'https://jane.dev',
      socialLinks: {},
    });

    expect(schema['@type']).toBe('Person');
  });

  it('includes jobTitle', () => {
    const schema = generatePersonSchema({
      name: 'Jane Doe',
      jobTitle: 'Senior Engineer',
      description: 'A developer',
      url: 'https://jane.dev',
      socialLinks: {},
    });

    expect(schema.jobTitle).toBe('Senior Engineer');
  });

  it('includes sameAs only for truthy social links', () => {
    const schema = generatePersonSchema({
      name: 'Jane Doe',
      jobTitle: 'Engineer',
      description: 'A developer',
      url: 'https://jane.dev',
      socialLinks: {
        github: 'https://github.com/jane',
        linkedin: undefined,
        twitter: 'https://twitter.com/jane',
      },
    }) as Record<string, unknown>;

    expect(schema['sameAs']).toEqual([
      'https://github.com/jane',
      'https://twitter.com/jane',
    ]);
  });
});

// ---------------------------------------------------------------------------
// generateWebsiteSchema()
// ---------------------------------------------------------------------------

describe('generateWebsiteSchema()', () => {
  it('returns @type WebSite', () => {
    const schema = generateWebsiteSchema({
      name: 'My Site',
      url: 'https://mysite.com',
      description: 'A personal website',
    });

    expect(schema['@type']).toBe('WebSite');
  });

  it('includes a SearchAction potentialAction', () => {
    const schema = generateWebsiteSchema({
      name: 'My Site',
      url: 'https://mysite.com',
      description: 'A personal website',
    });

    expect(schema.potentialAction['@type']).toBe('SearchAction');
    expect(schema.potentialAction.target.urlTemplate).toContain('https://mysite.com/blog?q=');
  });
});

// ---------------------------------------------------------------------------
// generateBlogPostingSchema()
// ---------------------------------------------------------------------------

describe('generateBlogPostingSchema()', () => {
  const baseData = {
    title: 'My Post',
    description: 'A great post',
    url: 'https://example.com/blog/my-post',
    image: 'https://example.com/img.jpg',
    datePublished: '2026-01-01',
    author: 'Jane Doe',
  };

  it('returns @type BlogPosting', () => {
    const schema = generateBlogPostingSchema(baseData);
    expect(schema['@type']).toBe('BlogPosting');
  });

  it('maps headline, description, image, url from input', () => {
    const schema = generateBlogPostingSchema(baseData);
    expect(schema.headline).toBe(baseData.title);
    expect(schema.description).toBe(baseData.description);
    expect(schema.image).toBe(baseData.image);
    expect(schema.url).toBe(baseData.url);
  });

  it('uses datePublished as dateModified when dateModified is omitted', () => {
    const schema = generateBlogPostingSchema(baseData);
    expect(schema.dateModified).toBe(baseData.datePublished);
  });

  it('uses provided dateModified when given', () => {
    const schema = generateBlogPostingSchema({ ...baseData, dateModified: '2026-06-01' });
    expect(schema.dateModified).toBe('2026-06-01');
  });

  it('uses getSiteName() for publisher name', () => {
    const schema = generateBlogPostingSchema(baseData);
    expect(schema.publisher.name).toBe('Example Site');
  });

  it('uses getSiteUrl() for publisher logo url', () => {
    const schema = generateBlogPostingSchema(baseData);
    expect(schema.publisher.logo.url).toBe('https://example.com/images/logo.png');
  });

  it('joins keywords array into a comma-separated string', () => {
    const schema = generateBlogPostingSchema({
      ...baseData,
      keywords: ['typescript', 'nextjs', 'testing'],
    }) as Record<string, unknown>;

    expect(schema['keywords']).toBe('typescript, nextjs, testing');
  });

  it('omits keywords when not provided', () => {
    const schema = generateBlogPostingSchema(baseData) as Record<string, unknown>;
    expect('keywords' in schema).toBe(false);
  });

  it('omits keywords when provided as empty array', () => {
    const schema = generateBlogPostingSchema({ ...baseData, keywords: [] }) as Record<string, unknown>;
    expect('keywords' in schema).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateBreadcrumbSchema()
// ---------------------------------------------------------------------------

describe('generateBreadcrumbSchema()', () => {
  it('returns @type BreadcrumbList', () => {
    const schema = generateBreadcrumbSchema([
      { name: 'Home', url: 'https://example.com' },
    ]);

    expect(schema['@type']).toBe('BreadcrumbList');
  });

  it('maps each item to a ListItem with 1-based position', () => {
    const schema = generateBreadcrumbSchema([
      { name: 'Home', url: 'https://example.com' },
      { name: 'Blog', url: 'https://example.com/blog' },
    ]);

    expect(schema.itemListElement).toHaveLength(2);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[0].name).toBe('Home');
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[1].name).toBe('Blog');
  });

  it('handles an empty items array', () => {
    const schema = generateBreadcrumbSchema([]);
    expect(schema.itemListElement).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// generateJSONLD()
// ---------------------------------------------------------------------------

describe('generateJSONLD()', () => {
  it('serialises a schema object to a JSON string', () => {
    const schema = { '@type': 'WebSite', name: 'Test' };
    const result = generateJSONLD(schema);

    expect(typeof result).toBe('string');
    expect(JSON.parse(result)).toEqual(schema);
  });

  it('produces valid JSON for nested structures', () => {
    const schema = generateWebsiteSchema({
      name: 'My Site',
      url: 'https://mysite.com',
      description: 'A test site',
    });

    const json = generateJSONLD(schema);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
