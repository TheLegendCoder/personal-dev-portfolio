/**
 * Slug helpers for content whose URL key is stored in Postgres.
 *
 * `portfolio_projects.slug` carries a `^[a-z0-9-]+$` CHECK constraint, so
 * anything this produces has to satisfy that pattern or the insert is rejected
 * by the database rather than by the form.
 *
 * Plain module (no 'use server') so the admin editor can import it client-side.
 */

/** The pattern enforced by the database CHECK constraint. */
export const SLUG_PATTERN = /^[a-z0-9-]+$/;

/**
 * Turn free text into a slug: lowercase, accents stripped, runs of anything
 * that isn't a letter or digit collapsed to a single hyphen.
 *
 * Returns '' for input with no usable characters — callers decide whether that
 * is an error, since the database treats an empty slug as a constraint failure.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    // Strip combining marks so "Café" becomes "cafe" rather than "caf".
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** True when the value is a slug Postgres will accept. */
export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
