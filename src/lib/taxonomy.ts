/**
 * The canonical topic vocabulary.
 *
 * `tags` on the content tables stays free-form — it is what authors have been
 * typing for months and still drives keywords and card labels. This module
 * defines the curated subset that gets navigable topic pages, plus the mapping
 * from loose tag values onto it, so `dotnet`, `.NET` and `ASP.NET Core` all
 * land on one page instead of three.
 *
 * Adding a topic here creates its page; nothing else needs changing.
 */

export const TOPICS = [
  'C#',
  '.NET',
  'Architecture',
  'AI',
  'Cloud',
  'Security',
  'Testing',
] as const;

export type Topic = (typeof TOPICS)[number];

/**
 * Aliases that should collapse onto a canonical topic, keyed by the lowercased
 * alias. The canonical names themselves are matched case-insensitively without
 * needing an entry here.
 */
const TOPIC_ALIASES: Record<string, Topic> = {
  // C#
  'csharp': 'C#',
  'c sharp': 'C#',
  'c# fundamentals': 'C#',
  // .NET
  'dotnet': '.NET',
  'net': '.NET',
  '.net core': '.NET',
  'asp.net': '.NET',
  'asp.net core': '.NET',
  'entity framework': '.NET',
  // Architecture
  'architecture': 'Architecture',
  'clean architecture': 'Architecture',
  'software architecture': 'Architecture',
  'distributed systems': 'Architecture',
  'system design': 'Architecture',
  'design patterns': 'Architecture',
  'api design': 'Architecture',
  'api architecture': 'Architecture',
  'microservices': 'Architecture',
  'messaging': 'Architecture',
  // AI
  'ai': 'AI',
  'artificial intelligence': 'AI',
  'machine learning': 'AI',
  'llm': 'AI',
  'llms': 'AI',
  // Cloud
  'cloud': 'Cloud',
  'azure': 'Cloud',
  'aws': 'Cloud',
  'devops': 'Cloud',
  'infrastructure': 'Cloud',
  'azure service bus': 'Cloud',
  // Security
  'security': 'Security',
  'authentication': 'Security',
  'authorization': 'Security',
  'auth': 'Security',
  'jwt': 'Security',
  'oauth': 'Security',
  // Testing
  'testing': 'Testing',
  'tests': 'Testing',
  'unit testing': 'Testing',
  'integration testing': 'Testing',
  'tdd': 'Testing',
};

const CANONICAL_BY_LOWER: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((topic) => [topic.toLowerCase(), topic])
);

/**
 * Map a free-form tag onto a canonical topic, or null when it is not one.
 * Returning null is normal — most tags are legitimately not canonical topics.
 */
export function normalizeTopic(tag: string): Topic | null {
  const key = tag.trim().toLowerCase();
  if (!key) return null;
  return CANONICAL_BY_LOWER[key] ?? TOPIC_ALIASES[key] ?? null;
}

/**
 * Canonical topics implied by a set of tags, de-duplicated and in the order
 * they appear in TOPICS so output is stable regardless of tag order.
 */
export function normalizeTopics(tags: string[]): Topic[] {
  const found = new Set<Topic>();
  tags.forEach((tag) => {
    const topic = normalizeTopic(tag);
    if (topic) found.add(topic);
  });
  return TOPICS.filter((topic) => found.has(topic));
}

/**
 * URL-safe form of a topic. `C#` and `.NET` both contain characters that do
 * not survive a path segment untouched, so this is not a plain lowercase.
 */
export function slugifyTopic(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/#/g, '-sharp')
    .replace(/\./g, 'dot')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const TOPIC_BY_SLUG: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((topic) => [slugifyTopic(topic), topic])
);

/** Resolve a URL segment back to its canonical topic, or null if unknown. */
export function topicFromSlug(slug: string): Topic | null {
  return TOPIC_BY_SLUG[slug.trim().toLowerCase()] ?? null;
}

/** Every canonical topic paired with its URL slug — used for topic indexes. */
export function allTopicSlugs(): { topic: Topic; slug: string }[] {
  return TOPICS.map((topic) => ({ topic, slug: slugifyTopic(topic) }));
}
