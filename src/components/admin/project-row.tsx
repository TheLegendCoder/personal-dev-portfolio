'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { PortfolioProject } from '@/lib/projects';
import {
  togglePublishedAction,
  toggleFeaturedAction,
  deleteProjectAction,
} from '@/app/admin/projects/actions';
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
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';

interface AdminProjectRowProps {
  project: PortfolioProject;
}

export function AdminProjectRow({ project }: AdminProjectRowProps) {
  const [isPending, startTransition] = useTransition();
  const [published, setPublished] = useState(project.published);
  const [featured, setFeatured] = useState(project.featured);

  const handlePublish = () => {
    const next = !published;
    setPublished(next);
    startTransition(() => togglePublishedAction(project.id, next));
  };

  const handleFeatured = () => {
    const next = !featured;
    setFeatured(next);
    startTransition(() => toggleFeaturedAction(project.id, next));
  };

  const handleDelete = () => {
    startTransition(() => deleteProjectAction(project.id));
  };

  return (
    <tr className={`hover:bg-muted/30 transition-colors ${isPending ? 'opacity-60' : ''}`}>
      {/* Title + category */}
      <td className="px-4 py-3">
        <div className="flex items-start flex-col gap-1">
          <span className="font-medium text-foreground line-clamp-1">{project.title}</span>
          <Badge
            className={`text-xs ${
              project.category === 'professional'
                ? 'bg-blue-600/10 text-blue-600'
                : 'bg-violet-600/10 text-violet-600'
            }`}
          >
            {project.category === 'professional' ? 'Professional' : 'Personal'}
          </Badge>
        </div>
      </td>

      {/* Tags */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} className="bg-muted text-muted-foreground text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{project.tags.length - 3}</span>
          )}
        </div>
      </td>

      {/* Published toggle */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={handlePublish}
          disabled={isPending}
          title={published ? 'Click to unpublish' : 'Click to publish'}
          className="inline-flex items-center justify-center"
        >
          <span
            className={`inline-block w-10 h-5 rounded-full transition-colors ${
              published ? 'bg-green-500' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${
                published ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </span>
        </button>
      </td>

      {/* Featured toggle (= shown on home page) */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={handleFeatured}
          disabled={isPending}
          title={featured ? 'Click to remove from home page' : 'Click to feature on home page'}
          className="inline-flex items-center justify-center"
        >
          <span
            className={`inline-block w-10 h-5 rounded-full transition-colors ${
              featured ? 'bg-amber-500' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${
                featured ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </span>
        </button>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/projects/${project.id}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Edit project"
          >
            <Pencil className="h-4 w-4" />
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                title="Delete project"
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{project.title}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the project. This action cannot be undone.
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
        </div>
      </td>
    </tr>
  );
}
