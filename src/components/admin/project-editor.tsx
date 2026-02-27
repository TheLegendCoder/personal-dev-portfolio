'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveProjectAction, deleteProjectAction } from '@/app/admin/projects/actions';
import type { PortfolioProject } from '@/lib/projects';
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
import { Save, Trash2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Must be a valid URL').or(z.literal('')),
  imageHint: z.string(),
  liveUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  githubUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  tags: z.string(), // comma-separated
  category: z.enum(['professional', 'personal']),
  published: z.boolean(),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0),
});

type ProjectForm = z.infer<typeof projectSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface ProjectEditorProps {
  project?: PortfolioProject; // undefined = new project
}

export function ProjectEditor({ project }: ProjectEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const isNew = !project;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? '',
      description: project?.description ?? '',
      image: project?.image ?? '',
      imageHint: project?.image_hint ?? '',
      liveUrl: project?.live_url ?? '',
      githubUrl: project?.github_url ?? '',
      tags: project?.tags?.join(', ') ?? '',
      category: project?.category ?? 'professional',
      published: project?.published ?? false,
      featured: project?.featured ?? false,
      sortOrder: project?.sort_order ?? 0,
    },
  });

  const onSubmit = async (values: ProjectForm) => {
    setServerError(null);
    startTransition(async () => {
      try {
        await saveProjectAction({
          ...(project?.id && { id: project.id }),
          title: values.title,
          description: values.description,
          image: values.image,
          image_hint: values.imageHint,
          live_url: values.liveUrl,
          github_url: values.githubUrl,
          tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
          category: values.category,
          published: values.published,
          featured: values.featured,
          sort_order: values.sortOrder,
        });
      } catch (err) {
        setServerError(String(err));
      }
    });
  };

  const handleDelete = () => {
    if (!project) return;
    startTransition(() => deleteProjectAction(project.id));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-foreground">
          {isNew ? 'New project' : `Editing: ${project.title}`}
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
                  <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{project.title}&quot;. This cannot be undone.
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

      {/* Metadata grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Project title" {...register('title')} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder="Brief project summary…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Live URL */}
        <div className="space-y-1.5">
          <Label htmlFor="liveUrl">Live URL</Label>
          <Input id="liveUrl" type="url" placeholder="https://…" {...register('liveUrl')} />
          {errors.liveUrl && <p className="text-xs text-destructive">{errors.liveUrl.message}</p>}
        </div>

        {/* GitHub URL */}
        <div className="space-y-1.5">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input id="githubUrl" type="url" placeholder="https://github.com/…" {...register('githubUrl')} />
          {errors.githubUrl && (
            <p className="text-xs text-destructive">{errors.githubUrl.message}</p>
          )}
        </div>

        {/* Image URL */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="image">Cover image URL</Label>
          <Input id="image" type="url" placeholder="https://…" {...register('image')} />
          {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
        </div>

        {/* Image hint */}
        <div className="space-y-1.5">
          <Label htmlFor="imageHint">Image alt text / hint</Label>
          <Input id="imageHint" placeholder="e.g. project screenshot" {...register('imageHint')} />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" placeholder="Next.js, TypeScript, Tailwind CSS" {...register('tags')} />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...register('category')}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="professional">Professional</option>
            <option value="personal">Personal</option>
          </select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* Sort order */}
        <div className="space-y-1.5">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            {...register('sortOrder', { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
        </div>

        {/* Toggles */}
        <div className="md:col-span-2 flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="sr-only" {...register('published')} />
            <ToggleVisual checked={watch('published')} />
            <span className="text-sm text-foreground">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="sr-only" {...register('featured')} />
            <ToggleVisual checked={watch('featured')} color="amber" />
            <span className="text-sm text-foreground">Featured on home page</span>
          </label>
        </div>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Small visual toggle indicator
// ---------------------------------------------------------------------------
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
