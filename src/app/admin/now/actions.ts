'use server';

import { revalidatePath } from 'next/cache';
import { updateNow } from '@/lib/now';
import { requireAuth } from '@/lib/supabase/require-auth';
import type { NowSection } from '@/lib/now-utils';

export async function saveNowAction(data: { body: string; sections: NowSection[] }) {
  await requireAuth();

  const result = await updateNow(data);
  if (!result.success) throw new Error(result.error ?? 'Failed to save the now page');

  revalidatePath('/now');
  revalidatePath('/admin/now');
  revalidatePath('/');
}
