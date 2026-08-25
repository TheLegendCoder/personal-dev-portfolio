export const dynamic = 'force-dynamic';

import { MetadataRoute } from 'next';
import { getAllBlogPostsForSitemap } from '@/lib/blog';
import { getAllTutorialsForSitemap } from '@/lib/tutorial';
import { getProjects } from '@/lib/projects';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tsholofelondawonde.co.za';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages.
  //
  // The IA refactor added /work, /writing, /now and /contact as hubs, and no
  // existing URL was removed or redirected — /projects, /blog and /tutorials
  // keep their rankings and are still linked from the header and footer.
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/writing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
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
    {
      url: `${SITE_URL}/now`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const [posts, tutorials, projects] = await Promise.all([
    getAllBlogPostsForSitemap(),
    getAllTutorialsForSitemap(),
    getProjects(),
  ]);

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const tutorialPages: MetadataRoute.Sitemap = tutorials.map((tutorial) => ({
    url: `${SITE_URL}/tutorials/${tutorial.slug}`,
    lastModified: new Date(tutorial.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Project detail pages were previously absent from the sitemap entirely.
  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.id}`,
    lastModified: new Date(project.updated_at || project.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...tutorialPages, ...projectPages];
}
