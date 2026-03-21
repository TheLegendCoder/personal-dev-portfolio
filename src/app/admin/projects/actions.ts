'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  upsertProject,
  updateProjectFields,
  deleteProject,
} from '@/lib/projects';
import type { DbProjectInsert } from '@/lib/supabase/types';
import { requireAuth } from '@/lib/supabase/require-auth';

export async function saveProjectAction(project: DbProjectInsert & { id?: string }) {
  await requireAuth();
  const result = await upsertProject(project);
  if (!result.success) throw new Error(result.error ?? 'Failed to save project');
  revalidatePath('/projects');
  revalidatePath('/admin/projects');
  revalidatePath('/');
  redirect('/admin/projects');
}

export async function togglePublishedAction(id: string, published: boolean) {
  await requireAuth();
  const result = await updateProjectFields(id, { published });
  if (!result.success) throw new Error(result.error ?? 'Failed to update');
  revalidatePath('/projects');
  revalidatePath('/admin/projects');
  revalidatePath('/');
}

export async function toggleFeaturedAction(id: string, featured: boolean) {
  await requireAuth();
  const result = await updateProjectFields(id, { featured });
  if (!result.success) throw new Error(result.error ?? 'Failed to update');
  revalidatePath('/projects');
  revalidatePath('/admin/projects');
  revalidatePath('/');
}

export async function deleteProjectAction(id: string) {
  await requireAuth();
  const result = await deleteProject(id);
  if (!result.success) throw new Error(result.error ?? 'Failed to delete project');
  revalidatePath('/projects');
  revalidatePath('/admin/projects');
  revalidatePath('/');
  redirect('/admin/projects');
}
