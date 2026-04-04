'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { BlogPostSummary } from '@/lib/blog';
import {
  togglePublishedAction,
  toggleFeaturedAction,
  deletePostAction,
} from '@/app/admin/blog/actions';
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
import { Pencil, Trash2 } from 'lucide-react';

interface AdminPostRowProps {
  post: BlogPostSummary;
}

export function AdminPostRow({ post }: AdminPostRowProps) {
  const [isPending, startTransition] = useTransition();
  const [published, setPublished] = useState(post.published);
  const [featured, setFeatured] = useState(post.featured);

  const handlePublish = () => {
    const next = !published;
    setPublished(next);
    startTransition(() => togglePublishedAction(post.slug, next));
  };

  const handleFeatured = () => {
    const next = !featured;
    setFeatured(next);
    startTransition(() => toggleFeaturedAction(post.slug, next));
  };

  const handleDelete = () => {
    startTransition(() => deletePostAction(post.slug));
  };

  const formattedDate = new Date(post.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <tr className={`hover:bg-muted/40 transition-colors group ${isPending ? 'opacity-60' : ''}`}>
      {/* Title */}
      <td className="px-4 py-3.5">
        <div className="flex items-start flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${published ? 'bg-accent' : 'bg-muted-foreground/40'}`}
            />
            <span className="font-medium text-foreground line-clamp-1">{post.title}</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono pl-3.5">/blog/{post.slug}</span>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap text-xs">{formattedDate}</td>

      {/* Published toggle */}
      <td className="px-4 py-3.5 text-center">
        <button
          onClick={handlePublish}
          disabled={isPending}
          title={published ? 'Click to unpublish' : 'Click to publish'}
          className="inline-flex items-center justify-center group/toggle"
        >
          <span
            className={`inline-block w-10 h-5 rounded-full transition-all ${
              published
                ? 'bg-accent shadow-[0_0_0_3px_hsl(var(--accent)/0.15)]'
                : 'bg-muted-foreground/25 hover:bg-muted-foreground/40'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow-md mt-0.5 transition-transform ${
                published ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </span>
        </button>
      </td>

      {/* Featured toggle */}
      <td className="px-4 py-3.5 text-center">
        <button
          onClick={handleFeatured}
          disabled={isPending}
          title={featured ? 'Click to unfeature' : 'Click to feature on home page'}
          className="inline-flex items-center justify-center"
        >
          <span
            className={`inline-block w-10 h-5 rounded-full transition-all ${
              featured
                ? 'bg-amber-500 shadow-[0_0_0_3px_hsl(45,93%,47%,0.15)]'
                : 'bg-muted-foreground/25 hover:bg-muted-foreground/40'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow-md mt-0.5 transition-transform ${
                featured ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </span>
        </button>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/blog/${post.slug}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
            title="Edit post"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                title="Delete post"
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{post.title}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the post. This action cannot be undone.
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
