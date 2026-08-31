// ---------------------------------------------------------------------------
// Pure helpers + types for the /now page.
//
// Split out of src/lib/now.ts (a 'use server' module) so these stay
// client-importable and so src/lib/supabase/types.ts can reference NowSection
// without pulling in a server module — mirroring src/lib/writing-utils.ts.
// ---------------------------------------------------------------------------

export interface NowSection {
  heading: string;
  items: string[];
}

export interface NowContent {
  /** ISO date the page was last revised, or null if unknown. */
  updated: string | null;
  sections: NowSection[];
  /** Rendered HTML of the markdown intro paragraph. */
  body: string;
}

/**
 * Coerce a raw value (jsonb column, frontmatter, form payload) into
 * `NowSection[]`, dropping anything malformed so a typo degrades the page
 * rather than crashing the route.
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
 * Normalise an `updated` value to an ISO string. Handles the `Date` that a
 * YAML/Postgres driver may hand back as well as a plain string.
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
