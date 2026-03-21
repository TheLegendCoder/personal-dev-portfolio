'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  upsertBlogPost,
  updateBlogPostFields,
  deleteBlogPost,
} from '@/lib/blog';
import type { DbBlogPostInsert } from '@/lib/supabase/types';
import { requireAuth } from '@/lib/supabase/require-auth';

export async function savePostAction(post: DbBlogPostInsert) {
  await requireAuth();
  const result = await upsertBlogPost(post);
  if (!result.success) throw new Error(result.error ?? 'Failed to save post');
  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/admin/blog');
  revalidatePath('/');
  redirect(`/admin/blog`);
}

export async function togglePublishedAction(slug: string, published: boolean) {
  await requireAuth();
  const result = await updateBlogPostFields(slug, { published });
  if (!result.success) throw new Error(result.error ?? 'Failed to update');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/admin/blog');
  revalidatePath('/');
}

export async function toggleFeaturedAction(slug: string, featured: boolean) {
  await requireAuth();
  const result = await updateBlogPostFields(slug, { featured });
  if (!result.success) throw new Error(result.error ?? 'Failed to update');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/admin/blog');
  revalidatePath('/');
}

export async function deletePostAction(slug: string) {
  await requireAuth();
  const result = await deleteBlogPost(slug);
  if (!result.success) throw new Error(result.error ?? 'Failed to delete post');
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  revalidatePath('/');
  redirect('/admin/blog');
}
