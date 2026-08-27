// ---------------------------------------------------------------------------
// Unified "writing" view over portfolio_posts + portfolio_tutorials.
//
// Deliberately NOT a 'use server' file: it exports a type and adds no new
// mutations. The Supabase reads live in blog.ts / tutorial.ts, which remain the
// 'use server' data layer this module composes.
// ---------------------------------------------------------------------------

import { getBlogPostsSummaryWithStatus } from '@/lib/blog';
import { getTutorialsSummaryWithStatus } from '@/lib/tutorial';

export type WritingType = 'article' | 'tutorial';

export interface WritingItem {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readTime: string;
  published: boolean;
  featured: boolean;
  image: string;
  imageHint: string;
  /** Which table this row came from — replaces deriving a label from tags[0]. */
  type: WritingType;
}

/** Newest first. */
function byDateDesc(a: WritingItem, b: WritingItem): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

/**
 * Published articles and tutorials merged into one date-sorted list, preserving
 * whether either fetch actually failed vs. genuinely returned no rows — the home
 * page uses that to tell "Supabase is down" apart from "nothing published yet".
 *
 * A failure in either source marks the whole result as errored: a half-populated
 * list is more misleading than an explicit error state.
 */
export async function getUnifiedWritingWithStatus(): Promise<{
  data: WritingItem[];
  error: boolean;
}> {
  const [posts, tutorials] = await Promise.all([
    getBlogPostsSummaryWithStatus(),
    getTutorialsSummaryWithStatus(),
  ]);

  const data = [
    ...posts.data.map((post) => ({ ...post, type: 'article' as const })),
    ...tutorials.data.map((tutorial) => ({ ...tutorial, type: 'tutorial' as const })),
  ].sort(byDateDesc);

  return { data, error: posts.error || tutorials.error };
}

/** Merged list without the error signal — for pages that render an empty state either way. */
export async function getUnifiedWriting(): Promise<WritingItem[]> {
  const { data } = await getUnifiedWritingWithStatus();
  return data;
}

/** Filter helper shared by the /writing tabs and the featured row. */
export function filterWritingByType(
  items: WritingItem[],
  type: WritingType | 'all',
): WritingItem[] {
  return type === 'all' ? items : items.filter((item) => item.type === type);
}
