'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { trackWritingFilter } from '@/lib/posthog-events';
import { TOPICS, slugifyTopic } from '@/lib/taxonomy';

const TYPE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Articles', value: 'article' },
  { label: 'Tutorials', value: 'tutorial' },
] as const;

interface WritingFiltersProps {
  currentType: string;
  currentTopic: string;
  topics: string[];
}

/**
 * Type and topic filters for the Writing hub.
 *
 * Follows the same searchParam-driven pattern as ProjectFilters — state lives
 * in the URL, so a filtered view is linkable and survives a refresh.
 */
export function WritingFilters({
  currentType,
  currentTopic,
  topics,
}: WritingFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const applyFilter = (key: 'type' | 'topic', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    trackWritingFilter(key, value);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter writing by type"
      >
        {TYPE_FILTERS.map((filter) => {
          const active = currentType === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => applyFilter('type', filter.value)}
              aria-pressed={active}
              className={cn(
                'mono-label border px-4 py-2 transition-colors duration-200',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Canonical topics link to their own indexable page rather than a
          query param, so /writing/topic/architecture can rank on its own.
          The free-form tags below stay as in-page filters. */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono-label mr-1 text-muted-foreground">Topics</span>
        {TOPICS.map((topic) => (
          <Link
            key={topic}
            href={`/writing/topic/${slugifyTopic(topic)}`}
            onClick={() => trackWritingFilter('topic', topic)}
            className="mono-label border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-foreground"
          >
            {topic}
          </Link>
        ))}
      </div>

      {topics.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter writing by tag"
        >
          <button
            type="button"
            onClick={() => applyFilter('topic', 'all')}
            aria-pressed={!currentTopic}
            className={cn(
              'mono-label border px-3 py-1.5 text-xs transition-colors duration-200',
              !currentTopic
                ? 'border-primary text-primary'
                : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
            )}
          >
            All tags
          </button>
          {topics.map((topic) => {
            const active = currentTopic.toLowerCase() === topic.toLowerCase();
            return (
              <button
                key={topic}
                type="button"
                onClick={() => applyFilter('topic', active ? 'all' : topic)}
                aria-pressed={active}
                className={cn(
                  'mono-label border px-3 py-1.5 text-xs transition-colors duration-200',
                  active
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                )}
              >
                {topic}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
