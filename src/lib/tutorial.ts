'use server';

import { markdownToHtml } from '@/lib/markdown';
import { createServiceClient, createAnonClient } from '@/lib/supabase/server';
import type { DbTutorialInsert, DbTutorialUpdate } from '@/lib/supabase/types';
import type { BlogPost as TutorialPost } from '@/lib/blog';

export type TutorialPostSummary = Omit<TutorialPost, 'content'>;
export type TutorialPostSitemap = Pick<TutorialPost, 'slug' | 'date'>;


// ---------------------------------------------------------------------------
// Public tutorial API — reads from Supabase, only published posts
// ---------------------------------------------------------------------------

export async function getTutorial(slug: string): Promise<TutorialPost | null> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_tutorials')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !data) return null;

    const htmlContent = await markdownToHtml(data.content);

    return {
      slug: data.slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      tags: data.tags ?? [],
      readTime: data.read_time,
      published: data.published,
      featured: data.featured,
      image: data.image,
      imageHint: data.image_hint,
      content: htmlContent,
    };
  } catch (error) {
    console.error(`Error fetching tutorial ${slug}:`, error);
    return null;
  }
}

export async function getAllTutorials(): Promise<TutorialPost[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_tutorials')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false });

    if (error || !data) return [];

    const posts = await Promise.all(
      data.map(async (row) => {
        const htmlContent = await markdownToHtml(row.content);
        return {
          slug: row.slug,
          title: row.title,
          description: row.description,
          date: row.date,
          author: row.author,
          tags: row.tags ?? [],
          readTime: row.read_time,
          published: row.published,
          featured: row.featured,
          image: row.image,
          imageHint: row.image_hint,
          content: htmlContent,
        } as TutorialPost;
      })
    );

    return posts;
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Admin tutorial API — reads all posts (no published filter), uses service role
// ---------------------------------------------------------------------------


export async function getAllTutorialsSummary(): Promise<TutorialPostSummary[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_tutorials')
      .select('slug, title, description, date, author, tags, read_time, published, featured, image, image_hint')
      .eq('published', true)
      .order('date', { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      date: row.date,
      author: row.author,
      tags: row.tags ?? [],
      readTime: row.read_time,
      published: row.published,
      featured: row.featured,
      image: row.image,
      imageHint: row.image_hint,
    }));
  } catch (error) {
    console.error('Error fetching tutorials summary:', error);
    return [];
  }
}

export async function getAllTutorialsForSitemap(): Promise<TutorialPostSitemap[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_tutorials')
      .select('slug, date')
      .eq('published', true)
      .order('date', { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      slug: row.slug,
      date: row.date,
    }));
  } catch (error) {
    console.error('Error fetching tutorials for sitemap:', error);
    return [];
  }
}

export async function getAllTutorialsAdmin(): Promise<TutorialPost[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('portfolio_tutorials')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      date: row.date,
      author: row.author,
      tags: row.tags ?? [],
      readTime: row.read_time,
      published: row.published,
      featured: row.featured,
      image: row.image,
      imageHint: row.image_hint,
      content: row.content, // raw markdown for admin
    }));
  } catch (error) {
    console.error('Error fetching admin tutorials:', error);
    return [];
  }
}


export async function getAllTutorialsAdminSummary(): Promise<TutorialPostSummary[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('portfolio_tutorials')
      .select('slug, title, description, date, author, tags, read_time, published, featured, image, image_hint')
      .order('date', { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      date: row.date,
      author: row.author,
      tags: row.tags ?? [],
      readTime: row.read_time,
      published: row.published,
      featured: row.featured,
      image: row.image,
      imageHint: row.image_hint,
    }));
  } catch (error) {
    console.error('Error fetching admin tutorials summary:', error);
    return [];
  }
}

export async function getTutorialAdmin(slug: string): Promise<TutorialPost | null> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('portfolio_tutorials')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;

    return {
      slug: data.slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      tags: data.tags ?? [],
      readTime: data.read_time,
      published: data.published,
      featured: data.featured,
      image: data.image,
      imageHint: data.image_hint,
      content: data.content, // raw markdown for admin
    };
  } catch (error) {
    console.error(`Error fetching admin tutorial ${slug}:`, error);
    return null;
  }
}

export async function upsertTutorial(
  tutorial: DbTutorialInsert
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('portfolio_tutorials')
      .upsert(tutorial, { onConflict: 'slug' });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function updateTutorialFields(
  slug: string,
  updates: DbTutorialUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('portfolio_tutorials')
      .update(updates)
      .eq('slug', slug);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteTutorial(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('portfolio_tutorials')
      .delete()
      .eq('slug', slug);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
