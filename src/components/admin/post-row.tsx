'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/lib/blog';
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
  post: BlogPost;
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
    <tr className={`hover:bg-muted/30 transition-colors ${isPending ? 'opacity-60' : ''}`}>
      {/* Title */}
      <td className="px-4 py-3">
        <div className="flex items-start flex-col gap-0.5">
          <span className="font-medium text-foreground line-clamp-1">{post.title}</span>
          <span className="text-xs text-muted-foreground">/blog/{post.slug}</span>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formattedDate}</td>

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

      {/* Featured toggle */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={handleFeatured}
          disabled={isPending}
          title={featured ? 'Click to unfeature' : 'Click to feature on home page'}
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
            href={`/admin/blog/${post.slug}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Edit post"
          >
            <Pencil className="h-4 w-4" />
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                title="Delete post"
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
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
