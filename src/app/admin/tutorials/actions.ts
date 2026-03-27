'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  upsertTutorial,
  updateTutorialFields,
  deleteTutorial,
} from '@/lib/tutorial';
import type { DbTutorialInsert } from '@/lib/supabase/types';
import { requireAuth } from '@/lib/supabase/require-auth';

export async function saveTutorialAction(tutorial: DbTutorialInsert) {
  await requireAuth();
  const result = await upsertTutorial(tutorial);
  if (!result.success) throw new Error(result.error ?? 'Failed to save tutorial');
  revalidatePath('/tutorials');
  revalidatePath(`/tutorials/${tutorial.slug}`);
  revalidatePath('/admin/tutorials');
  revalidatePath('/');
  redirect(`/admin/tutorials`);
}

export async function toggleTutorialPublishedAction(slug: string, published: boolean) {
  await requireAuth();
  const result = await updateTutorialFields(slug, { published });
  if (!result.success) throw new Error(result.error ?? 'Failed to update');
  revalidatePath('/tutorials');
  revalidatePath(`/tutorials/${slug}`);
  revalidatePath('/admin/tutorials');
  revalidatePath('/');
}

export async function toggleTutorialFeaturedAction(slug: string, featured: boolean) {
  await requireAuth();
  const result = await updateTutorialFields(slug, { featured });
  if (!result.success) throw new Error(result.error ?? 'Failed to update');
  revalidatePath('/tutorials');
  revalidatePath(`/tutorials/${slug}`);
  revalidatePath('/admin/tutorials');
  revalidatePath('/');
}

export async function deleteTutorialAction(slug: string) {
  await requireAuth();
  const result = await deleteTutorial(slug);
  if (!result.success) throw new Error(result.error ?? 'Failed to delete tutorial');
  revalidatePath('/tutorials');
  revalidatePath('/admin/tutorials');
  revalidatePath('/');
  redirect('/admin/tutorials');
}
