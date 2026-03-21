import { createClient } from '@/lib/supabase/server';

/**
 * Server-side auth guard for Server Actions.
 * Throws an error if there is no authenticated session, which Next.js
 * surfaces as a 500 and prevents the action body from executing.
 *
 * Always call this as the very first line of every admin Server Action —
 * middleware alone is not sufficient because Server Actions can be invoked
 * directly via POST and are outside the middleware routing layer.
 */
export async function requireAuth(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized: you must be signed in to perform this action.');
  }
}
