'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function signInAction(
  email: string,
  password: string,
  redirectedFrom: string
): Promise<{ error: string }> {
  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = `${ip}:${email.toLowerCase()}`;

  if (!checkRateLimit(key, { limit: MAX_ATTEMPTS, windowMs: WINDOW_MS })) {
    return { error: 'Too many sign-in attempts. Please wait a few minutes and try again.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Validate the redirect target to prevent open-redirect attacks.
  // Only allow relative paths that start with /admin; discard anything else.
  const redirectTo =
    redirectedFrom.startsWith('/admin') && !redirectedFrom.startsWith('//')
      ? redirectedFrom
      : '/admin/blog';
  redirect(redirectTo);
}
