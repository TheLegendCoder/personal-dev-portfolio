import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tsholofelondawonde.co.za';
const SITE_NAME = 'Tsholofelo Ndawonde';
const SITE_TITLE = 'Tsholofelo Ndawonde | Software Engineer';
const SITE_DESCRIPTION = 'Software engineer documenting learnings through code. Building scalable web apps and sharing experiments, lessons, and projects.';

export interface SEOMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
  noIndex?: boolean;
  canonicalUrl?: string;
}

/**
 * Generate comprehensive SEO metadata for Next.js pages
 * Includes OpenGraph, Twitter Cards, and canonical URLs
 */
export function generateSEOMetadata({
  title,
  description,
  image,
  imageAlt,
  type = 'website',
  publishedTime,
  authors,
  tags,
  noIndex = false,
  canonicalUrl,
}: SEOMetadataProps): Metadata {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE;
  const pageDescription = description || SITE_DESCRIPTION;
  // No /public folder exists in this repo — the default share image is the
  // generated route at src/app/opengraph-image.tsx, not a static file.
  const pageImage = image || `${SITE_URL}/opengraph-image`;
  const pageImageAlt = imageAlt || title || SITE_NAME;

  const metadata: Metadata = {
    title: pageTitle,
    description: pageDescription,
    authors: authors ? authors.map(name => ({ name })) : [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: canonicalUrl || SITE_URL,
    },
    openGraph: {
      title: title || SITE_TITLE,
      description: pageDescription,
      url: canonicalUrl || SITE_URL,
      siteName: SITE_NAME,
      locale: 'en_ZA',
      type: type,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageImageAlt,
        },
      ],
      ...(type === 'article' && publishedTime && {
        publishedTime,
        authors: authors || [SITE_NAME],
        tags: tags || [],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: title || SITE_TITLE,
      description: pageDescription,
      images: [pageImage],
      creator: '@tsholofelo_dev',
    },
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  return metadata;
}

/**
 * Generate canonical URL for a given path
 */
export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Get site URL from environment or default
 */
export function getSiteUrl(): string {
  return SITE_URL;
}

/**
 * Get site name
 */
export function getSiteName(): string {
  return SITE_NAME;
}
