import { getSiteUrl, getSiteName } from './metadata';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate Organization JSON-LD schema
 */
export function generateOrganizationSchema(data: {
  name: string;
  description: string;
  url: string;
  email?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}) {
  const sameAs = Object.values(data.socialLinks).filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    description: data.description,
    url: data.url,
    ...(data.email && { email: data.email }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/**
 * Generate Person JSON-LD schema
 */
export function generatePersonSchema(data: {
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  email?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}) {
  const sameAs = Object.values(data.socialLinks).filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    jobTitle: data.jobTitle,
    description: data.description,
    url: data.url,
    ...(data.email && { email: data.email }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/**
 * Generate Website JSON-LD schema
 */
export function generateWebsiteSchema(data: {
  name: string;
  url: string;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    description: data.description,
    // No `potentialAction`/SearchAction here: the site has no search endpoint.
    // It previously advertised /blog?q={search_term_string}, a parameter
    // nothing implements — declaring a search action that 404s is worse for
    // crawlers than declaring none. Reinstate this when search actually ships.
  };
}

/**
 * Generate BlogPosting JSON-LD schema
 */
export function generateBlogPostingSchema(data: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  keywords?: string[];
}) {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    image: data.image,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: {
      '@type': 'Person',
      name: data.author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/opengraph-image`,
      },
    },
    url: data.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url,
    },
    ...(data.keywords && data.keywords.length > 0 && {
      keywords: data.keywords.join(', '),
    }),
  };
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Inject JSON-LD script into page
 */
export function generateJSONLD(schema: object): string {
  return JSON.stringify(schema);
}
