import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Column lists for the writing summary queries, plus a fallback that lets the
 * app run against a database where the Stage 2 migrations have not been
 * applied yet.
 *
 * Without this, deploying the code before running
 * supabase/migrations/0001_content_taxonomy.sql makes every summary query fail
 * with "column portfolio_posts.topics does not exist" — which the data layer
 * turns into an empty array, blanking /blog, /tutorials and /writing until the
 * SQL is run. Migrations are applied by hand in the Supabase dashboard, so the
 * two can easily land out of order.
 *
 * The detail queries do not need this: they `select('*')`, and the mappers
 * already default every Stage 2 field, so a pre-migration row maps cleanly.
 */

/** Postgres `undefined_column`. */
const UNDEFINED_COLUMN = '42703';

/** Columns present before migrations 0001/0003. */
export const LEGACY_SUMMARY_COLUMNS =
  'slug, title, description, date, author, tags, read_time, published, featured, image, image_hint';

/** Columns once 0001 and 0003 have been applied. */
export const SUMMARY_COLUMNS =
  'slug, title, description, date, author, tags, topics, evergreen, read_time, published, featured, image, image_hint, related_post_slugs, related_tutorial_slugs, related_project_slugs';

/**
 * A summary row as it comes back from either column list. Everything the
 * migrations add is optional, because a pre-migration row simply will not have
 * it — the mappers default each one.
 *
 * Declared here rather than in blog.ts/tutorial.ts because those are
 * `'use server'` modules, where exported bindings become server actions.
 */
export interface WritingSummaryRow {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[] | null;
  read_time: string;
  published: boolean;
  featured: boolean;
  image: string;
  image_hint: string;
  topics?: string[] | null;
  evergreen?: boolean | null;
  related_post_slugs?: string[] | null;
  related_tutorial_slugs?: string[] | null;
  related_project_slugs?: string[] | null;
}

interface QueryResult<T> {
  data: T[] | null;
  error: PostgrestError | null;
}

/**
 * Run a summary query with the full column list, retrying against the legacy
 * list if the database reports a missing column. Any other error is returned
 * untouched for the caller to log and handle.
 *
 * The result is cast because passing a non-literal string to `.select()` loses
 * Supabase's row-type inference — the shape is guaranteed by the two column
 * constants above, which is exactly what WritingSummaryRow describes.
 */
export async function withSummaryColumns<T = WritingSummaryRow>(
  run: (
    columns: string
  ) => PromiseLike<{ data: unknown; error: PostgrestError | null }>
): Promise<QueryResult<T>> {
  let result = await run(SUMMARY_COLUMNS);

  if (result.error?.code === UNDEFINED_COLUMN) {
    console.warn(
      '[supabase] Stage 2 taxonomy columns are missing — falling back to the ' +
        'legacy column list. Apply supabase/migrations/ to enable topics and ' +
        'related content.'
    );
    result = await run(LEGACY_SUMMARY_COLUMNS);
  }

  return { data: (result.data as T[] | null) ?? null, error: result.error };
}
