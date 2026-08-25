/**
 * Single source of truth for public site navigation.
 *
 * Both the header (`src/components/layout/header.tsx`) and the footer
 * (`src/components/layout/footer.tsx`) read from here — they previously kept
 * two separate hardcoded arrays that drifted apart.
 *
 * The IA is narrative rather than by-content-type:
 *   About → who I am · Work → what I've built · Writing → what I've learned
 *   Now → what I'm doing · Contact → how to reach me
 *
 * Legacy section routes (/projects, /blog, /tutorials) are kept alive for SEO
 * and are mapped onto their new parent via `matchPaths`.
 */

export interface NavChild {
  name: string;
  path: string;
}

export interface NavItem {
  name: string;
  path: string;
  /**
   * Extra route prefixes that should light this item up. `path` is always
   * matched too, so only legacy/aliased sections need listing here.
   */
  matchPaths?: string[];
  children?: NavChild[];
}

export const primaryNav: NavItem[] = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  {
    name: 'Work',
    path: '/work',
    matchPaths: ['/projects'],
    children: [
      { name: 'Projects', path: '/projects?category=professional' },
      { name: 'Experiments', path: '/projects?category=personal' },
    ],
  },
  {
    name: 'Writing',
    path: '/writing',
    matchPaths: ['/blog', '/tutorials'],
    children: [
      { name: 'All', path: '/writing' },
      { name: 'Articles', path: '/writing?type=article' },
      { name: 'Tutorials', path: '/tutorials' },
    ],
  },
  { name: 'Now', path: '/now' },
  { name: 'Contact', path: '/contact' },
];

/**
 * Footer keeps a flat list — no dropdowns — and adds the legal page.
 * Sub-sections are surfaced directly so /projects, /blog and /tutorials
 * remain one click away and keep their internal links for crawlers.
 */
export const footerNav: NavChild[] = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Work', path: '/work' },
  { name: 'Projects', path: '/projects' },
  { name: 'Writing', path: '/writing' },
  { name: 'Blog', path: '/blog' },
  { name: 'Tutorials', path: '/tutorials' },
  { name: 'Now', path: '/now' },
  { name: 'Contact', path: '/contact' },
  { name: 'Privacy', path: '/privacy' },
];

/** Strip any query string or hash so nav paths can be compared to a pathname. */
function toPathname(path: string): string {
  return path.split(/[?#]/)[0] || '/';
}

/**
 * True when `pathname` sits at or beneath `base`.
 * Segment-aware, so `/workshop` does not match `/work`.
 */
function isUnder(pathname: string, base: string): boolean {
  if (base === '/') return pathname === '/';
  return pathname === base || pathname.startsWith(`${base}/`);
}

/**
 * Whether a nav item should render as active for the current pathname.
 *
 * Unlike the old `pathname === link.path` check, this is prefix-aware: a post
 * at /blog/some-slug highlights Writing, and /projects/<id> highlights Work.
 */
export function isNavItemActive(
  pathname: string,
  item: Pick<NavItem, 'path' | 'matchPaths'>
): boolean {
  const candidates = [item.path, ...(item.matchPaths ?? [])].map(toPathname);
  return candidates.some((base) => isUnder(pathname, base));
}
