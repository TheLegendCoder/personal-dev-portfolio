import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Reader for the /now page.
 *
 * Unlike blog posts, tutorials and projects, the now page is not CMS content —
 * it is a short, frequently-rewritten personal statement, so it lives in the
 * repo at `src/content/now.md` and ships with a deploy. No Supabase, no admin
 * screen, no schema.
 */

export interface NowSection {
  heading: string;
  items: string[];
}

export interface NowContent {
  /** ISO date the page was last revised, or null if the file omits it. */
  updated: string | null;
  sections: NowSection[];
  /** Rendered HTML of the markdown body below the frontmatter. */
  body: string;
}

const NOW_FILE = path.join(process.cwd(), 'src', 'content', 'now.md');

/**
 * Coerce raw frontmatter into `NowSection[]`, dropping anything malformed.
 * The file is hand-edited, so a typo should degrade the page rather than
 * crash the route.
 */
export function parseNowSections(raw: unknown): NowSection[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const { heading, items } = entry as { heading?: unknown; items?: unknown };
    if (typeof heading !== 'string' || !heading.trim()) return [];

    const cleanItems = Array.isArray(items)
      ? items.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
      : [];

    return [{ heading, items: cleanItems }];
  });
}

/**
 * Normalise the `updated` frontmatter value. gray-matter's YAML parser turns
 * an unquoted `2026-08-25` into a Date, so both forms have to be handled.
 */
export function parseNowUpdated(raw: unknown): string | null {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw.toISOString();
  }
  if (typeof raw === 'string') {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return null;
}

export async function getNowContent(): Promise<NowContent> {
  const file = fs.readFileSync(NOW_FILE, 'utf8');
  const { data, content } = matter(file);

  // Imported lazily so the markdown pipeline (remark + highlight.js) is not
  // pulled into any bundle that only needs the frontmatter.
  const { markdownToHtml } = await import('@/lib/markdown');

  return {
    updated: parseNowUpdated(data.updated),
    sections: parseNowSections(data.sections),
    body: content.trim() ? await markdownToHtml(content) : '',
  };
}
