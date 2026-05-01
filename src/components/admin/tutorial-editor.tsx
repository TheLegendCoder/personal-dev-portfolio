'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveTutorialAction, deleteTutorialAction } from '@/app/admin/tutorials/actions';
import type { BlogPost as TutorialPost } from '@/lib/blog';
import { markdownToHtml } from '@/lib/markdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Eye, Save, Trash2, FileText, Hash, CalendarDays, User, Clock, Tag, Link2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().min(1, 'Description is required'),
  author: z.string().min(1, 'Author is required'),
  date: z.string().min(1, 'Date is required'),
  tags: z.string(), // comma-separated, converted on save
  readTime: z.string().min(1, 'Read time is required'),
  image: z.string().url('Must be a valid URL'),
  imageHint: z.string(),
  published: z.boolean(),
  featured: z.boolean(),
  content: z.string().min(1, 'Content is required'),
});

type PostForm = z.infer<typeof postSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface TutorialEditorProps {
  tutorial?: TutorialPost; // undefined = new tutorial
}

export function TutorialEditor({ tutorial }: TutorialEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const isNew = !tutorial;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: tutorial?.title ?? '',
      slug: tutorial?.slug ?? '',
      description: tutorial?.description ?? '',
      author: tutorial?.author ?? 'Tsholofelo Ndawonde',
      date: tutorial?.date ?? new Date().toISOString().split('T')[0],
      tags: tutorial?.tags?.join(', ') ?? '',
      readTime: tutorial?.readTime ?? '',
      image: tutorial?.image ?? '',
      imageHint: tutorial?.imageHint ?? '',
      published: tutorial?.published ?? false,
      featured: tutorial?.featured ?? false,
      content: tutorial?.content ?? '',
    },
  });

  const content = watch('content');
  const titleValue = watch('title');

  // Auto-generate slug from title (only for new posts)
  useEffect(() => {
    if (isNew && titleValue) {
      setValue('slug', titleToSlug(titleValue), { shouldValidate: false });
    }
  }, [isNew, titleValue, setValue]);

  // Live markdown preview
  const updatePreview = useCallback(async (md: string) => {
    if (!md) { setPreview(''); return; }
    try {
      const html = await markdownToHtml(md);
      setPreview(html);
    } catch {
      setPreview('<p class="text-muted-foreground">Preview unavailable</p>');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => updatePreview(content), 300);
    return () => clearTimeout(timer);
  }, [content, updatePreview]);

  const onSubmit = async (values: PostForm) => {
    setServerError(null);
    startTransition(async () => {
      try {
        await saveTutorialAction({
          slug: values.slug,
          title: values.title,
          description: values.description,
          author: values.author,
          date: values.date,
          tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
          read_time: values.readTime,
          image: values.image,
          image_hint: values.imageHint,
          published: values.published,
          featured: values.featured,
          content: values.content,
        });
      } catch (err) {
        setServerError(String(err));
      }
    });
  };

  const handleDelete = () => {
    if (!tutorial) return;
    startTransition(() => deleteTutorialAction(tutorial.slug));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Sticky action bar */}
      <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-card/95 backdrop-blur border-b border-border border-l-4 border-l-primary flex items-center justify-between gap-4 mb-2">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">
            {isNew ? 'New tutorial' : tutorial.title}
          </h1>
          <p className="text-xs text-muted-foreground">{isNew ? 'Draft — unsaved' : 'Editing tutorial'}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors border border-destructive/25"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this tutorial?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{tutorial.title}". This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 h-8 px-4 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            {isPending ? 'Saving…' : 'Save tutorial'}
          </button>
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 px-4 py-3 rounded-lg">
          <span className="font-semibold shrink-0">Error:</span>
          <span>{serverError}</span>
        </div>
      )}

      {/* ── Card: Tutorial Details ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-primary/5">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Tutorial Details</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
          {/* Title */}
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Title
            </Label>
            <Input id="title" placeholder="Tutorial title" className="text-sm font-medium" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Hash className="h-3 w-3" /> Slug
            </Label>
            <Input id="slug" placeholder="tutorial-slug" className="font-mono text-sm" {...register('slug')} />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <CalendarDays className="h-3 w-3" /> Date
            </Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Description
            </Label>
            <Input id="description" placeholder="One-sentence summary…" {...register('description')} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {/* Author */}
          <div className="space-y-1.5">
            <Label htmlFor="author" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <User className="h-3 w-3" /> Author
            </Label>
            <Input id="author" {...register('author')} />
            {errors.author && <p className="text-xs text-destructive">{errors.author.message}</p>}
          </div>

          {/* Read time */}
          <div className="space-y-1.5">
            <Label htmlFor="readTime" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Clock className="h-3 w-3" /> Read time
            </Label>
            <Input id="readTime" placeholder="e.g. 6 min" {...register('readTime')} />
            {errors.readTime && <p className="text-xs text-destructive">{errors.readTime.message}</p>}
          </div>

          {/* Tags */}
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="tags" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Tag className="h-3 w-3" /> Tags
            </Label>
            <Input id="tags" placeholder="TypeScript, React, Next.js" {...register('tags')} />
            <p className="text-xs text-muted-foreground">Separate multiple tags with commas.</p>
          </div>

          {/* Image URL */}
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="image" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Link2 className="h-3 w-3" /> Cover image URL
            </Label>
            <Input id="image" type="url" placeholder="https://…" {...register('image')} />
            {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
          </div>

          {/* Image hint */}
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="imageHint" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Image alt / hint
            </Label>
            <Input id="imageHint" placeholder="Descriptive alt text for the cover image" {...register('imageHint')} />
          </div>
        </div>
      </div>

      {/* ── Card: Publishing Settings ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-accent/5">
          <Eye className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">Publishing Settings</h2>
        </div>
        <div className="px-5 py-5 flex flex-wrap gap-8">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" className="sr-only" {...register('published')} />
            <ToggleVisual checked={watch('published')} />
            <div>
              <p className="text-sm font-medium text-foreground">Published</p>
              <p className="text-xs text-muted-foreground">Visible on the public blog</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" className="sr-only" {...register('featured')} />
            <ToggleVisual checked={watch('featured')} color="amber" />
            <div>
              <p className="text-sm font-medium text-foreground">Featured</p>
              <p className="text-xs text-muted-foreground">Pinned to the home page</p>
            </div>
          </label>
        </div>
      </div>

      {/* ── Editor + Preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Markdown textarea */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Markdown source</span>
          </div>
          <div className="flex-1 p-3">
            <textarea
              id="content"
              {...register('content')}
              rows={30}
              placeholder="Write your post in Markdown…"
              className="w-full h-full rounded-lg bg-muted/20 px-3 py-2.5 text-sm font-mono resize-y min-h-[420px] focus:outline-none focus:ring-2 focus:ring-ring border border-border"
            />
            {errors.content && (
              <p className="text-xs text-destructive mt-1.5 px-1">{errors.content.message}</p>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Live preview</span>
          </div>
          <div
            className="flex-1 p-5 overflow-auto min-h-[420px] prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: preview || '<p class="text-muted-foreground text-sm italic">Start typing to see a live preview…</p>' }}
          />
        </div>
      </div>
    </form>
  );
}

// Small visual toggle
function ToggleVisual({
  checked,
  color = 'green',
}: {
  checked: boolean;
  color?: 'green' | 'amber';
}) {
  const bg = checked
    ? color === 'green'
      ? 'bg-emerald-500'
      : 'bg-amber-500'
    : 'bg-muted-foreground/25';
  const ring = checked
    ? color === 'green'
      ? 'ring-2 ring-emerald-500/25'
      : 'ring-2 ring-amber-500/25'
    : '';
  return (
    <span className={`relative inline-flex w-11 h-6 rounded-full transition-all duration-200 shrink-0 ${bg} ${ring}`}>
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </span>
  );
}
