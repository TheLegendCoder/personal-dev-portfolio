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
 * Breadcrumbs for a content detail page: Home > Section > Title.
 *
 * The Home crumb is included so these match `generateBreadcrumbs` — the two
 * previously disagreed, which produced inconsistent BreadcrumbList schema
 * depending on which page a crawler landed on.
 */
function generateDetailBreadcrumbs(
  sectionName: string,
  sectionPath: string,
  title: string
): BreadcrumbItem[] {
  const siteUrl = getSiteUrl();

  return [
    {
      name: 'Home',
      url: siteUrl,
    },
    {
      name: sectionName,
      url: `${siteUrl}${sectionPath}`,
    },
    {
      name: title,
      url: '', // Current page, no URL needed
    },
  ];
}

/**
 * Generate breadcrumbs for blog post pages (Home > Blog > Post Title)
 */
export function generateBlogPostBreadcrumbs(postTitle: string): BreadcrumbItem[] {
  return generateDetailBreadcrumbs('Blog', '/blog', postTitle);
}

/**
 * Generate breadcrumbs for tutorial pages (Home > Tutorials > Tutorial Title)
 */
export function generateTutorialBreadcrumbs(tutorialTitle: string): BreadcrumbItem[] {
  return generateDetailBreadcrumbs('Tutorials', '/tutorials', tutorialTitle);
}

/**
 * Generate breadcrumbs for project detail pages (Home > Projects > Project Title)
 */
export function generateProjectBreadcrumbs(projectTitle: string): BreadcrumbItem[] {
  return generateDetailBreadcrumbs('Projects', '/projects', projectTitle);
}
