import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/** Server Component / Server Action client — respects the logged-in user's session */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // In Server Components, cookie setting is a no-op — middleware handles refresh.
          }
        },
      },
    }
  );
}

/** Service-role client — bypasses RLS. Only use in trusted server actions. */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        fetch: (url, options = {}) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          const signals = [controller.signal, (options as RequestInit).signal].filter(
            (s): s is AbortSignal => s instanceof AbortSignal,
          );
          return fetch(url, {
            ...options,
            signal: signals.length > 1 ? AbortSignal.any(signals) : signals[0],
            cache: 'no-store',
          }).finally(() => clearTimeout(timeout));
        },
      },
    }
  );
}

/** Simple anon client — for public reads, no cookie/session management needed. */
export function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options = {}) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000); // 15s — enough headroom for SSR cold starts
          const signals = [controller.signal, (options as RequestInit).signal].filter(
            (s): s is AbortSignal => s instanceof AbortSignal,
          );
          return fetch(url, {
            ...options,
            signal: signals.length > 1 ? AbortSignal.any(signals) : signals[0],
            cache: 'force-cache', // Allow route-level revalidate to apply (e.g., ISR on home page).
          }).finally(() => clearTimeout(timeout));
        },
      },
    }
  );
}
