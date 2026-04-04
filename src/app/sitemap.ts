export const dynamic = 'force-dynamic';

import { MetadataRoute } from 'next';
import { getAllBlogPostsForSitemap } from '@/lib/blog';
import { getAllTutorialsForSitemap } from '@/lib/tutorial';
import { getBlogPostsSummary } from '@/lib/blog';
import { getTutorialsSummary } from '@/lib/tutorial';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tsholofelondawonde.co.za';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/tutorials`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Dynamic blog posts
  const posts = await getAllBlogPostsForSitemap();
  const posts = await getBlogPostsSummary();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Dynamic tutorials
  const tutorials = await getAllTutorialsForSitemap();
  const tutorials = await getTutorialsSummary();
  const tutorialPages: MetadataRoute.Sitemap = tutorials.map((tutorial) => ({
    url: `${SITE_URL}/tutorials/${tutorial.slug}`,
    lastModified: new Date(tutorial.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...tutorialPages];
}
