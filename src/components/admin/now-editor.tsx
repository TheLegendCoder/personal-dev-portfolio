'use client';
'use no memo';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Eye, Plus, Radio, Save, Trash2 } from 'lucide-react';
import { saveNowAction } from '@/app/admin/now/actions';
import type { NowSection } from '@/lib/now-utils';
import { markdownToHtml } from '@/lib/markdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ---------------------------------------------------------------------------
// Schema — `items` is a textarea string (one bullet per line), split on save.
// ---------------------------------------------------------------------------
const nowSchema = z.object({
  body: z.string(),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1, 'Heading is required'),
        items: z.string(),
      })
    )
    .min(1, 'Add at least one section'),
});

type NowForm = z.infer<typeof nowSchema>;

function linesToItems(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

interface NowEditorProps {
  now: {
    body: string;
    sections: NowSection[];
    updated: string | null;
  };
}

export function NowEditor({ now }: NowEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NowForm>({
    resolver: zodResolver(nowSchema),
    defaultValues: {
      body: now.body ?? '',
      sections: (now.sections ?? []).map((s) => ({
        heading: s.heading,
        items: s.items.join('\n'),
      })),
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: 'sections' });

  const body = useWatch({ control, name: 'body' }) ?? '';

  const updatePreview = useCallback(async (md: string) => {
    if (!md.trim()) {
      setPreview('');
      return;
    }
    try {
      setPreview(await markdownToHtml(md));
    } catch {
      setPreview('<p class="text-muted-foreground text-sm">Preview unavailable</p>');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => updatePreview(body), 300);
    return () => clearTimeout(timer);
  }, [body, updatePreview]);

  const onSubmit = (values: NowForm) => {
    setServerError(null);
    setSavedAt(null);
    startTransition(async () => {
      try {
        await saveNowAction({
          body: values.body,
          sections: values.sections.map((s) => ({
            heading: s.heading.trim(),
            items: linesToItems(s.items),
          })),
        });
        setSavedAt(new Date().toISOString());
      } catch (err) {
        setServerError(String(err));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Sticky action bar */}
      <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between gap-4 mb-2">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-primary" />
            Now page
          </h1>
          <p className="text-xs text-muted-foreground">
            {now.updated
              ? `Last updated ${format(new Date(now.updated), 'd MMMM yyyy')}`
              : 'Not yet published'}
            {' — the date is set automatically on save.'}
          </p>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 h-8 px-4 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm shrink-0"
        >
          <Save className="h-3.5 w-3.5" />
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>

      {serverError && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 px-4 py-3 rounded-lg">
          <span className="font-semibold shrink-0">Error:</span>
          <span>{serverError}</span>
        </div>
      )}

      {savedAt && !serverError && (
        <div className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-lg">
          Saved — the public /now page now shows {format(new Date(savedAt), 'd MMMM yyyy')}.
        </div>
      )}

      {/* ── Card: Intro paragraph ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-primary/5">
          <Eye className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Intro paragraph</h2>
        </div>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="body" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Markdown source
            </Label>
            <textarea
              id="body"
              {...register('body')}
              rows={6}
              placeholder="A short intro shown above the sections…"
              className="w-full rounded-lg bg-muted/20 px-3 py-2.5 text-sm font-mono resize-y min-h-[140px] focus:outline-none focus:ring-2 focus:ring-ring border border-border"
            />
            <p className="text-xs text-muted-foreground">
              Markdown — links like [label](url) are supported. Leave blank to hide the intro.
            </p>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Live preview</span>
            <div
              className="rounded-lg border border-border bg-muted/10 p-4 min-h-[140px] prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  preview || '<p class="text-muted-foreground text-sm italic">Start typing to see a preview…</p>',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Card: Sections ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-accent/5">
          <h2 className="text-sm font-semibold text-foreground">Sections</h2>
          <button
            type="button"
            onClick={() => append({ heading: '', items: '' })}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-primary border border-primary/25 hover:bg-primary/10 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add section
          </button>
        </div>
        <div className="p-5 space-y-4">
          {errors.sections?.message && (
            <p className="text-xs text-destructive">{errors.sections.message}</p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-border bg-muted/10 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label
                    htmlFor={`sections.${index}.heading`}
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    Heading
                  </Label>
                  <Input
                    id={`sections.${index}.heading`}
                    placeholder="e.g. Building"
                    className="text-sm font-medium"
                    {...register(`sections.${index}.heading` as const)}
                  />
                  {errors.sections?.[index]?.heading && (
                    <p className="text-xs text-destructive">
                      {errors.sections[index]?.heading?.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 pt-6 shrink-0">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Move section up"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === fields.length - 1}
                    aria-label="Move section down"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Remove section"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`sections.${index}.items`}
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Items — one per line
                </Label>
                <textarea
                  id={`sections.${index}.items`}
                  {...register(`sections.${index}.items` as const)}
                  rows={4}
                  placeholder={'One bullet per line…'}
                  className="w-full rounded-lg bg-muted/20 px-3 py-2.5 text-sm resize-y min-h-[96px] focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                />
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No sections yet. Add one to get started.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
