'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { savePostAction, deletePostAction } from '@/app/admin/blog/actions';
import type { BlogPost } from '@/lib/blog';
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
import { Eye, Save, Trash2 } from 'lucide-react';

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
interface PostEditorProps {
  post?: BlogPost; // undefined = new post
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const isNew = !post;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      description: post?.description ?? '',
      author: post?.author ?? 'Tsholofelo Ndawonde',
      date: post?.date ?? new Date().toISOString().split('T')[0],
      tags: post?.tags?.join(', ') ?? '',
      readTime: post?.readTime ?? '',
      image: post?.image ?? '',
      imageHint: post?.imageHint ?? '',
      published: post?.published ?? false,
      featured: post?.featured ?? false,
      content: post?.content ?? '',
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
        await savePostAction({
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
    if (!post) return;
    startTransition(() => deletePostAction(post.slug));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-foreground">
          {isNew ? 'New post' : `Editing: ${post.title}`}
        </h1>
        <div className="flex items-center gap-2">
          {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors border border-destructive/30"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{post.title}&quot;. This cannot be undone.
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
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {serverError}
        </p>
      )}

      {/* Two-column metadata grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Post title" {...register('title')} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" placeholder="post-slug" {...register('slug')} />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Input id="description" placeholder="One-sentence summary" {...register('description')} />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Author */}
        <div className="space-y-1.5">
          <Label htmlFor="author">Author</Label>
          <Input id="author" {...register('author')} />
          {errors.author && <p className="text-xs text-destructive">{errors.author.message}</p>}
        </div>

        {/* Read time */}
        <div className="space-y-1.5">
          <Label htmlFor="readTime">Read time</Label>
          <Input id="readTime" placeholder="e.g. 6 min" {...register('readTime')} />
          {errors.readTime && (
            <p className="text-xs text-destructive">{errors.readTime.message}</p>
          )}
        </div>

        {/* Tags */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" placeholder="TypeScript, React, Next.js" {...register('tags')} />
        </div>

        {/* Image URL */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="image">Cover image URL</Label>
          <Input
            id="image"
            type="url"
            placeholder="https://..."
            {...register('image')}
          />
          {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
        </div>

        {/* Image hint */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="imageHint">Image alt text / hint</Label>
          <Input id="imageHint" placeholder="Descriptive alt text for the cover image" {...register('imageHint')} />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="sr-only" {...register('published')} />
            <ToggleVisual checked={watch('published')} />
            <span className="text-sm text-foreground">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="sr-only" {...register('featured')} />
            <ToggleVisual checked={watch('featured')} color="amber" />
            <span className="text-sm text-foreground">Featured on home</span>
          </label>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Markdown textarea */}
        <div className="space-y-1.5">
          <Label htmlFor="content">Content (Markdown)</Label>
          <textarea
            id="content"
            {...register('content')}
            rows={28}
            placeholder="Write your post in Markdown…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y min-h-[300px] focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.content && (
            <p className="text-xs text-destructive">{errors.content.message}</p>
          )}
        </div>

        {/* Live preview */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </div>
          <div
            className="rounded-md border border-input bg-muted/20 px-4 py-3 overflow-auto min-h-[300px] prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: preview || '<p class="text-muted-foreground text-sm">Start typing to see a preview…</p>' }}
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
      ? 'bg-green-500'
      : 'bg-amber-500'
    : 'bg-muted-foreground/30';
  return (
    <span className={`inline-block w-10 h-5 rounded-full transition-colors ${bg}`}>
      <span
        className={`block w-4 h-4 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </span>
  );
}
