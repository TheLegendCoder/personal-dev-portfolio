'use client';

import { useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Save, Trash2, FolderKanban, Globe, Github, Tag, Image, ArrowUpDown, Layers, Eye } from 'lucide-react';

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
    control,
    register,
    handleSubmit,
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

  const published = useWatch({ control, name: 'published' }) ?? false;
  const featured = useWatch({ control, name: 'featured' }) ?? false;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Sticky action bar */}
      <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-card/95 backdrop-blur border-b border-border border-l-4 border-l-primary flex items-center justify-between gap-4 mb-2">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">
            {isNew ? 'New project' : project.title}
          </h1>
          <p className="text-xs text-muted-foreground">{isNew ? 'Draft — unsaved' : 'Editing project'}</p>
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
            className="inline-flex items-center gap-1.5 h-8 px-4 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            {isPending ? 'Saving…' : 'Save project'}
          </button>
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 px-4 py-3 rounded-lg">
          <span className="font-semibold shrink-0">Error:</span>
          <span>{serverError}</span>
        </div>
      )}

      {/* ── Card: Project Details ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-primary/5">
          <FolderKanban className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Project Details</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
          {/* Title */}
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Title
            </Label>
            <Input id="title" placeholder="Project title" className="text-sm font-medium" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Description
            </Label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              placeholder="Brief project summary…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Live URL */}
          <div className="space-y-1.5">
            <Label htmlFor="liveUrl" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Globe className="h-3 w-3" /> Live URL
            </Label>
            <Input id="liveUrl" type="url" placeholder="https://…" {...register('liveUrl')} />
            {errors.liveUrl && <p className="text-xs text-destructive">{errors.liveUrl.message}</p>}
          </div>

          {/* GitHub URL */}
          <div className="space-y-1.5">
            <Label htmlFor="githubUrl" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Github className="h-3 w-3" /> GitHub URL
            </Label>
            <Input id="githubUrl" type="url" placeholder="https://github.com/…" {...register('githubUrl')} />
            {errors.githubUrl && <p className="text-xs text-destructive">{errors.githubUrl.message}</p>}
          </div>

          {/* Image URL */}
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="image" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Image className="h-3 w-3" /> Cover image URL
            </Label>
            <Input id="image" type="url" placeholder="https://…" {...register('image')} />
            {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
          </div>

          {/* Image hint */}
          <div className="space-y-1.5">
            <Label htmlFor="imageHint" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Image alt / hint
            </Label>
            <Input id="imageHint" placeholder="e.g. project screenshot" {...register('imageHint')} />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="tags" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Tag className="h-3 w-3" /> Tags
            </Label>
            <Input id="tags" placeholder="Next.js, TypeScript, Tailwind CSS" {...register('tags')} />
            <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
          </div>
        </div>
      </div>

      {/* ── Card: Publishing Settings ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-accent/5">
          <Eye className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">Publishing Settings</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="category" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Layers className="h-3 w-3" /> Category
            </Label>
            <select
              id="category"
              {...register('category')}
              className="w-full h-10 rounded-lg border border-border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="professional">Professional</option>
              <option value="personal">Personal</option>
            </select>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          {/* Sort order */}
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder" className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <ArrowUpDown className="h-3 w-3" /> Sort order
            </Label>
            <Input
              id="sortOrder"
              type="number"
              min={0}
              {...register('sortOrder', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
          </div>

          {/* Toggles */}
          <div className="md:col-span-2 flex flex-wrap gap-8 pt-1">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" className="sr-only" {...register('published')} />
              <ToggleVisual checked={published} />
              <div>
                <p className="text-sm font-medium text-foreground">Published</p>
                <p className="text-xs text-muted-foreground">Visible to the public</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" className="sr-only" {...register('featured')} />
              <ToggleVisual checked={featured} color="amber" />
              <div>
                <p className="text-sm font-medium text-foreground">Featured</p>
                <p className="text-xs text-muted-foreground">Pinned to the home page</p>
              </div>
            </label>
          </div>
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
