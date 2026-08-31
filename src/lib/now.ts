'use server';

/**
 * Data layer for the /now page.
 *
 * The now content lives in the `portfolio_now` singleton table (one row,
 * id = 1) and is edited from /admin/now. Pure helpers and types are in
 * ./now-utils so they stay client-importable.
 */

import { createServiceClient, createAnonClient } from '@/lib/supabase/server';
import {
  parseNowSections,
  parseNowUpdated,
  type NowContent,
  type NowSection,
} from '@/lib/now-utils';

type MarkdownToHtml = (markdown: string) => Promise<string>;

let markdownToHtmlFn: MarkdownToHtml | null = null;

async function renderMarkdown(markdown: string): Promise<string> {
  if (!markdownToHtmlFn) {
    const markdownModule = await import('@/lib/markdown');
    markdownToHtmlFn = markdownModule.markdownToHtml;
  }
  return markdownToHtmlFn(markdown);
}

const EMPTY: NowContent = { updated: null, sections: [], body: '' };

/**
 * Public read for the /now route. Best-effort: any failure (including the
 * table not existing yet during a deploy-before-migrate window) returns an
 * empty NowContent so the route never 500s.
 */
export async function getNowContent(): Promise<NowContent> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_now')
      .select('body, sections, updated_at')
      .eq('id', 1)
      .single();

    if (error || !data) return EMPTY;

    return {
      updated: parseNowUpdated(data.updated_at),
      sections: parseNowSections(data.sections),
      body: data.body?.trim() ? await renderMarkdown(data.body) : '',
    };
  } catch (err) {
    console.error('Error fetching now content:', err);
    return EMPTY;
  }
}

/**
 * Admin read — raw markdown body, no rendering. Used by /admin/now.
 */
export async function getNowAdmin(): Promise<{
  body: string;
  sections: NowSection[];
  updated: string | null;
}> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('portfolio_now')
      .select('body, sections, updated_at')
      .eq('id', 1)
      .single();

    if (error || !data) return { body: '', sections: [], updated: null };

    return {
      body: data.body ?? '',
      sections: parseNowSections(data.sections),
      updated: parseNowUpdated(data.updated_at),
    };
  } catch (err) {
    console.error('Error fetching now content for admin:', err);
    return { body: '', sections: [], updated: null };
  }
}

/**
 * Update the single now row. `updated_at` is stamped here so the public
 * "Last updated" date always reflects the most recent save.
 */
export async function updateNow(fields: {
  body: string;
  sections: NowSection[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('portfolio_now')
      .update({
        body: fields.body,
        sections: fields.sections,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
