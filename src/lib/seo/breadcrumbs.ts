import { BreadcrumbItem } from './structured-data';
import { getSiteUrl } from './metadata';

/**
 * Generate breadcrumb items from a URL path
 */
export function generateBreadcrumbs(path: string, customLabels?: Record<string, string>): BreadcrumbItem[] {
  const siteUrl = getSiteUrl();
  const segments = path.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'Home',
      url: siteUrl,
    },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Use custom label if provided, otherwise format the segment
    const label = customLabels?.[segment] || formatSegmentLabel(segment);
    
    breadcrumbs.push({
      name: label,
      url: `${siteUrl}${currentPath}`,
    });
  });

  return breadcrumbs;
}

/**
 * Format a URL segment into a readable label
 */
function formatSegmentLabel(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate breadcrumbs for blog post pages (simplified: Writing > Post Title).
 * Points at /writing rather than /blog — the latter now 301s, and a crumb that
 * redirects costs every post page a needless hop.
 */
export function generateBlogPostBreadcrumbs(postTitle: string): BreadcrumbItem[] {
  const siteUrl = getSiteUrl();

  return [
    {
      name: 'Writing',
      url: `${siteUrl}/writing`,
    },
    {
      name: postTitle,
      url: '', // Current page, no URL needed
    },
  ];
}

/**
 * Generate breadcrumbs for project detail pages (simplified: Projects > Project Title)
 */
export function generateProjectBreadcrumbs(projectTitle: string): BreadcrumbItem[] {
  const siteUrl = getSiteUrl();

  return [
    {
      name: 'Projects',
      url: `${siteUrl}/projects`,
    },
    {
      name: projectTitle,
      url: '', // Current page, no URL needed
    },
  ];
}
