/**
 * Pure helpers behind the Writing hub.
 *
 * Kept separate from `writing.ts` because that module is `'use server'`, where
 * every export becomes a server action. Merging, sorting and filtering are
 * synchronous and belong on whichever side of the boundary needs them.
 */

export type WritingType = 'article' | 'tutorial';

export interface WritingItem {
  type: WritingType;
  slug: string;
  /** Canonical URL of the piece — still /blog/… or /tutorials/… */
  href: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readTime: string;
  image: string;
  imageHint: string;
  featured: boolean;
}

/** The shared shape of `BlogPostSummary` and `TutorialPostSummary`. */
export interface WritingSourceSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readTime: string;
  image: string;
  imageHint: string;
  featured: boolean;
}

export function toWritingItem(
  type: WritingType,
  row: WritingSourceSummary
): WritingItem {
  return {
    type,
    slug: row.slug,
    href: type === 'article' ? `/blog/${row.slug}` : `/tutorials/${row.slug}`,
    title: row.title,
    description: row.description,
    date: row.date,
    author: row.author,
    tags: row.tags ?? [],
    readTime: row.readTime,
    image: row.image,
    imageHint: row.imageHint,
    featured: row.featured,
  };
}

/** Merge both content sources into one stream, newest first. */
export function mergeWriting(
  articles: WritingSourceSummary[],
  tutorials: WritingSourceSummary[]
): WritingItem[] {
  return [
    ...articles.map((row) => toWritingItem('article', row)),
    ...tutorials.map((row) => toWritingItem('tutorial', row)),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Distinct tags across the given items, alphabetical, for the topic filter. */
export function collectTopics(items: WritingItem[]): string[] {
  const topics = new Set<string>();
  items.forEach((item) => item.tags.forEach((tag) => topics.add(tag)));
  return Array.from(topics).sort((a, b) => a.localeCompare(b));
}

export interface WritingFilters {
  type?: string;
  topic?: string;
}

/**
 * Apply the hub's `?type=` and `?topic=` filters. Both are case-insensitive so
 * a hand-typed or lowercased URL still resolves.
 */
export function filterWriting(
  items: WritingItem[],
  { type, topic }: WritingFilters
): WritingItem[] {
  const normalizedType = type?.toLowerCase();
  const normalizedTopic = topic?.toLowerCase();

  return items.filter((item) => {
    if (normalizedType && normalizedType !== 'all' && item.type !== normalizedType) {
      return false;
    }
    if (
      normalizedTopic &&
      !item.tags.some((tag) => tag.toLowerCase() === normalizedTopic)
    ) {
      return false;
    }
    return true;
  });
}
