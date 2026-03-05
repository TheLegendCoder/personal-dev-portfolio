// ---------------------------------------------------------------------------
// Data-access layer for portfolio_projects (Supabase)
// ---------------------------------------------------------------------------

import { createClient, createServiceClient, createAnonClient } from '@/lib/supabase/server';
import type {
  PortfolioProject,
  DbProjectInsert,
  DbProjectUpdate,
  ProjectCategory,
} from '@/lib/supabase/types';
import { projects as staticProjects, type Project } from '@/components/data/content';

export type { PortfolioProject, ProjectCategory };

// ---------------------------------------------------------------------------
// Static fallback — used when Supabase is unreachable (paused project, network failure, etc.)
// ---------------------------------------------------------------------------

function toPortfolioProject(p: Project, index: number): PortfolioProject {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image,
    image_hint: '',
    tags: p.tags,
    live_url: p.liveUrl ?? '',
    github_url: p.githubUrl ?? '',
    featured: p.featured ?? false,
    published: true,
    category: p.category ?? 'personal',
    sort_order: index,
    created_at: '',
    updated_at: '',
  };
}

// ---------------------------------------------------------------------------
// Public reads (published only — uses anon client / RLS)
// ---------------------------------------------------------------------------

/** All published projects ordered by sort_order, then created_at */
export async function getProjects(): Promise<PortfolioProject[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getProjects] Supabase error:', error.message, '| code:', error.code);
      return staticProjects.map((p: Project, index: number) => toPortfolioProject(p, index));
    }

    console.log('[getProjects] Supabase returned', data?.length ?? 0, 'rows');

    // Fall back to static data if Supabase returned nothing
    if (!data || data.length === 0) {
      console.warn('[getProjects] No rows from Supabase — using static fallback');
      return staticProjects.map((p: Project, index: number) => toPortfolioProject(p, index));
    }
    return data;
  } catch (err) {
    console.error('[getProjects] Fetch exception:', err);
    return staticProjects.map((p: Project, index: number) => toPortfolioProject(p, index));
  }
}

/** Published + featured projects — used on the home page */
export async function getFeaturedProjects(): Promise<PortfolioProject[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getFeaturedProjects] Supabase error:', error.message, '| code:', error.code);
      return staticProjects.filter((p: Project) => p.featured).map((p: Project, index: number) => toPortfolioProject(p, index));
    }

    console.log('[getFeaturedProjects] Supabase returned', data?.length ?? 0, 'rows');

    if (!data || data.length === 0) {
      console.warn('[getFeaturedProjects] No rows from Supabase — using static fallback');
      return staticProjects.filter((p: Project) => p.featured).map((p: Project, index: number) => toPortfolioProject(p, index));
    }
    return data;
  } catch (err) {
    console.error('[getFeaturedProjects] Fetch exception:', err);
    return staticProjects.filter((p: Project) => p.featured).map((p: Project, index: number) => toPortfolioProject(p, index));
  }
}

/** Published projects filtered by category */
export async function getProjectsByCategory(
  category: ProjectCategory,
): Promise<PortfolioProject[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('published', true)
      .eq('category', category)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getProjectsByCategory] Supabase error for category', category, ':', error.message, '| code:', error.code);
      return staticProjects
        .filter((p: Project) => (p.category ?? 'personal') === category)
        .map((p: Project, index: number) => toPortfolioProject(p, index));
    }

    console.log('[getProjectsByCategory]', category, '— Supabase returned', data?.length ?? 0, 'rows');

    if (!data || data.length === 0) {
      const fallback = staticProjects
        .filter((p: Project) => (p.category ?? 'personal') === category)
        .map((p: Project, index: number) => toPortfolioProject(p, index));
      if (fallback.length > 0) {
        console.warn('[getProjectsByCategory] No rows from Supabase — using static fallback (' + fallback.length + ' items)');
        return fallback;
      }
      return [];
    }
    return data;
  } catch (err) {
    console.error('[getProjectsByCategory] Fetch exception:', err);
    return staticProjects
      .filter((p: Project) => (p.category ?? 'personal') === category)
      .map((p: Project, index: number) => toPortfolioProject(p, index));
  }
}

// ---------------------------------------------------------------------------
// Admin reads (all rows — uses service-role client, bypasses RLS)
// ---------------------------------------------------------------------------

/** All projects for the admin panel (includes unpublished) */
export async function getAllProjectsAdmin(): Promise<PortfolioProject[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getAllProjectsAdmin]', error.message, error.code, error.details);
    throw new Error(`[getAllProjectsAdmin] ${error.message}`);
  }
  return data ?? [];
}

/** Single project by id — admin use */
export async function getProjectByIdAdmin(
  id: string,
): Promise<PortfolioProject | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getProjectByIdAdmin]', error.message, error.code, error.details);
    return null;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Writes (service-role, called from Server Actions only)
// ---------------------------------------------------------------------------

export async function upsertProject(
  project: DbProjectInsert & { id?: string },
): Promise<{ success: boolean; error?: string; data?: PortfolioProject }> {
  const supabase = createServiceClient();

  const payload = project.id
    ? project // update — id present
    : { ...project }; // insert — no id, Supabase generates uuid

  const { data, error } = await supabase
    .from('portfolio_projects')
    .upsert(payload)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateProjectFields(
  id: string,
  fields: DbProjectUpdate,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('portfolio_projects')
    .update(fields)
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteProject(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('portfolio_projects')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
