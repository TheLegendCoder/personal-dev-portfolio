'use client';

import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { Tag, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TOPICS, normalizeTopics } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';

/** Comma-separated slug list ⇄ string[], shared by every relation field. */
export function parseSlugList(value: string): string[] {
  return value
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean);
}

export function formatSlugList(slugs: string[] | null | undefined): string {
  return (slugs ?? []).join(', ');
}

interface TopicPickerProps {
  value: string[];
  onChange: (topics: string[]) => void;
  /** Current free-form tags, used to show which topics are already implied. */
  tags: string[];
}

/**
 * Curated topic selector.
 *
 * `tags` stays free-form; `topics` is the subset that gets a navigable page at
 * /writing/topic/<slug>. Topics a piece's tags already imply are shown as
 * suggestions so an author does not have to re-derive them by hand.
 */
export function TopicPicker({ value, onChange, tags }: TopicPickerProps) {
  const selected = new Set(value);
  const implied = new Set(normalizeTopics(tags));

  const toggle = (topic: string) => {
    const next = new Set(selected);
    if (next.has(topic)) {
      next.delete(topic);
    } else {
      next.add(topic);
    }
    // Keep TOPICS order so the stored array is stable between saves.
    onChange(TOPICS.filter((t) => next.has(t)));
  };

  return (
    <div className="md:col-span-2 space-y-1.5">
      <Label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Tag className="h-3 w-3" /> Topics
      </Label>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((topic) => {
          const isSelected = selected.has(topic);
          return (
            <button
              key={topic}
              type="button"
              onClick={() => toggle(topic)}
              aria-pressed={isSelected}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
              )}
            >
              {topic}
              {!isSelected && implied.has(topic) && (
                <span className="ml-1.5 opacity-60">· from tags</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Canonical topics get their own page at /writing/topic/…. Tags stay
        free-form; these are the curated subset.
      </p>
    </div>
  );
}

/** The relation fields any editor using RelatedFields must declare. */
export interface RelationFormFields extends FieldValues {
  relatedPostSlugs: string;
  relatedTutorialSlugs: string;
  relatedProjectSlugs: string;
}

interface RelatedFieldsProps<T extends RelationFormFields> {
  idPrefix: string;
  register: UseFormRegister<T>;
  /** Omitted on the editor for that same content type, to avoid self-links. */
  include?: { posts?: boolean; tutorials?: boolean; projects?: boolean };
}

/**
 * Related-content slug inputs. Relations are declared one-way here and
 * resolved in both directions at render time by getRelatedContent, so a link
 * only has to be recorded on one side.
 */
export function RelatedFields<T extends RelationFormFields>({
  idPrefix,
  register,
  include = { posts: true, tutorials: true, projects: true },
}: RelatedFieldsProps<T>) {
  const fields = [
    { key: 'relatedPostSlugs', label: 'Related articles', show: include.posts, placeholder: 'why-i-built-x, another-post' },
    { key: 'relatedTutorialSlugs', label: 'Related tutorials', show: include.tutorials, placeholder: 'building-x-step-by-step' },
    { key: 'relatedProjectSlugs', label: 'Related projects', show: include.projects, placeholder: 'clean-architecture-generator' },
  ].filter((field) => field.show);

  return (
    <>
      {fields.map((field) => (
        <div key={field.key} className="md:col-span-2 space-y-1.5">
          <Label
            htmlFor={`${idPrefix}-${field.key}`}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <Link2 className="h-3 w-3" /> {field.label}
          </Label>
          <Input
            id={`${idPrefix}-${field.key}`}
            placeholder={field.placeholder}
            {...register(field.key as Path<T>)}
          />
        </div>
      ))}
      <p className="md:col-span-2 -mt-1 text-xs text-muted-foreground">
        Comma-separated slugs. The link shows on both pages — you only need to
        record it once, on either side.
      </p>
    </>
  );
}
