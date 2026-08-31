'use server';

import { getBlogPostsSummary } from '@/lib/blog';
import { getTutorialsSummary } from '@/lib/tutorial';
import { collectTopics, mergeWriting, type WritingItem } from '@/lib/writing-utils';

/**
 * Unified read layer over the two content sources behind the Writing hub.
 *
 * Articles live in `portfolio_posts` and tutorials in `portfolio_tutorials` —
 * two tables with identical shapes, surfaced at /blog and /tutorials. Those
 * routes are unchanged; this module only merges them so /writing can present a
 * single stream. It composes the existing summary queries rather than issuing
 * its own Supabase reads.
 */

/** Every published article and tutorial, newest first. */
export async function getAllWriting(): Promise<WritingItem[]> {
  const [articles, tutorials] = await Promise.all([
    getBlogPostsSummary(),
    getTutorialsSummary(),
  ]);

  return mergeWriting(articles, tutorials);
}

/**
 * Pieces explicitly marked `featured` in the CMS.
 *
 * There is no most-recent fallback here, unlike `getTopBlogPosts`. The Writing
 * hub renders Latest directly below Featured, so a fallback would print the
 * same cards twice — an empty result means "hide the section".
 */
export async function getFeaturedWriting(limit = 3): Promise<WritingItem[]> {
  const all = await getAllWriting();
  return all.filter((item) => item.featured).slice(0, limit);
}

/** Distinct tags across all writing, alphabetical, for the topic filter. */
export async function getWritingTopics(): Promise<string[]> {
  return collectTopics(await getAllWriting());
}
