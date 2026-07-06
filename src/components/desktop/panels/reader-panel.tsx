'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BlogPostSkeleton } from '@/components/ui/skeleton';
import { getBlogPost, getBlogPostsSummary, type BlogPost, type BlogPostSummary } from '@/lib/blog';
import { getTutorial, getTutorialsSummary, type TutorialPostSummary } from '@/lib/tutorial';
import type { BlogPost as TutorialPost } from '@/lib/blog';
import 'highlight.js/styles/atom-one-dark.css';

interface ReaderPanelProps {
  kind: 'blog' | 'tutorials';
}

type Summary = BlogPostSummary | TutorialPostSummary;
type FullPost = BlogPost | TutorialPost;

function formatDate(date: string): string {
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return date;
  }
}

export function ReaderPanel({ kind }: ReaderPanelProps) {
  const [summaries, setSummaries] = useState<Summary[] | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [post, setPost] = useState<FullPost | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);

  const isTutorials = kind === 'tutorials';
  const fetchSummaries = isTutorials ? getTutorialsSummary : getBlogPostsSummary;
  const fetchOne = isTutorials ? getTutorial : getBlogPost;

  useEffect(() => {
    let cancelled = false;
    setSummaries(null);
    setPost(null);
    setSelectedSlug(null);
    fetchSummaries().then((data) => {
      if (cancelled) return;
      setSummaries(data);
      if (data.length > 0) setSelectedSlug(data[0].slug);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  useEffect(() => {
    if (!selectedSlug) return;
    let cancelled = false;
    setLoadingPost(true);
    fetchOne(selectedSlug).then((data) => {
      if (cancelled) return;
      setPost(data);
      setLoadingPost(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);

  return (
    <div className="flex h-full min-h-0">
      <div className="flex w-[230px] shrink-0 flex-col overflow-y-auto border-r border-border bg-muted/20">
        <div className="border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          {isTutorials ? 'Tutorials · learning' : 'All posts'}
        </div>
        {summaries === null && <div className="p-3 text-xs text-muted-foreground">Loading…</div>}
        {summaries?.length === 0 && (
          <div className="p-3 text-xs text-muted-foreground">Nothing published yet.</div>
        )}
        {summaries?.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => setSelectedSlug(item.slug)}
            className={cn(
              'border-b border-border/40 px-4 py-3 text-left transition-colors',
              selectedSlug === item.slug
                ? isTutorials
                  ? 'border-l-2 border-l-accent bg-accent/10'
                  : 'border-l-2 border-l-primary bg-primary/10'
                : 'border-l-2 border-l-transparent hover:bg-muted/50'
            )}
          >
            <div className="line-clamp-2 text-sm font-medium text-foreground">{item.title}</div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">
              {formatDate(item.date)} · {item.readTime}
            </div>
          </button>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto bg-background p-5">
        {loadingPost || !post ? (
          <BlogPostSkeleton />
        ) : (
          <article>
            {post.tags[0] && (
              <span
                className={cn(
                  'mb-3 inline-block rounded-md border px-2 py-0.5 font-mono text-[11px]',
                  isTutorials
                    ? 'border-accent/30 bg-accent/10 text-accent'
                    : 'border-primary/30 bg-primary/10 text-primary'
                )}
              >
                {post.tags[0]}
              </span>
            )}
            <h1 className="mb-1.5 text-xl font-bold leading-tight text-foreground">
              {post.title}
            </h1>
            <div className="mb-5 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readTime}
              </span>
            </div>
            <div
              className="prose prose-sm dark:prose-invert prose-headings:font-display prose-a:text-primary max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        )}
      </div>
    </div>
  );
}
