'use server';

import { markdownToHtml } from '@/lib/markdown';
import { createServiceClient, createAnonClient } from '@/lib/supabase/server';
import type { DbBlogPostInsert, DbBlogPostUpdate } from '@/lib/supabase/types';

interface BlogPostBase {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readTime: string;
  published: boolean;
  featured: boolean;
  image: string;
  imageHint: string;
}

export type BlogPostSummary = BlogPostBase;
export type BlogPostSitemap = Pick<BlogPostBase, 'slug' | 'date'>;

export interface BlogPost extends BlogPostBase {
  content: string;
}

function mapBlogPostSummary(row: {
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
}): BlogPostSummary {
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
  };
}

// ---------------------------------------------------------------------------
// Public blog API — reads from Supabase, only published posts
// ---------------------------------------------------------------------------

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_posts')
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
    console.error(`Error fetching blog post ${slug}:`, error);
    return null;
  }
}

export async function getTopBlogPosts(limit: number = 3): Promise<BlogPostSummary[]> {
  try {
    const supabase = createAnonClient();

    const { data: featuredData, error: featuredError } = await supabase
      .from('portfolio_posts')
      .select('slug, title, description, date, author, tags, read_time, published, featured, image, image_hint')
      .eq('published', true)
      .eq('featured', true)
      .order('date', { ascending: false })
      .limit(limit);

    if (featuredError) {
      console.error('Error fetching featured blog posts:', featuredError);
      return [];
    }

    let posts = featuredData ?? [];

    if (posts.length === 0) {
      const { data: recentData, error: recentError } = await supabase
        .from('portfolio_posts')
        .select('slug, title, description, date, author, tags, read_time, published, featured, image, image_hint')
        .eq('published', true)
        .order('date', { ascending: false })
        .limit(limit);

      if (recentError) {
        console.error('Error fetching recent blog posts:', recentError);
        return [];
      }

      posts = recentData ?? [];
    }

    return posts.map(mapBlogPostSummary);
  } catch (error) {
    console.error('Error fetching top blog posts:', error);
    return [];
  }
}

export async function getBlogPostsSummary(): Promise<BlogPostSummary[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_posts')
      .select('slug, title, description, date, author, tags, read_time, published, featured, image, image_hint')
      .eq('published', true)
      .order('date', { ascending: false });

    if (error || !data) return [];

    return data.map(mapBlogPostSummary);
  } catch (error) {
    console.error('Error fetching blog post summaries:', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Backward-compatible summary API
// ---------------------------------------------------------------------------

export async function getAllBlogPostsSummary(): Promise<BlogPostSummary[]> {
  return getBlogPostsSummary();
}

export async function getAllBlogPostsForSitemap(): Promise<BlogPostSitemap[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_posts')
      .select('slug, date')
      .eq('published', true)
      .order('date', { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      slug: row.slug,
      date: row.date,
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Admin blog API — reads all posts, uses service role
// ---------------------------------------------------------------------------

export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('portfolio_posts')
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
      content: row.content,
    }));
  } catch (error) {
    console.error('Error fetching admin blog posts:', error);
    return [];
  }
}

export async function getAllBlogPostsAdminSummary(): Promise<BlogPostSummary[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('portfolio_posts')
      .select('slug, title, description, date, author, tags, read_time, published, featured, image, image_hint')
      .order('date', { ascending: false });

    if (error || !data) return [];

    return data.map(mapBlogPostSummary);
  } catch (error) {
    console.error('Error fetching admin blog posts summary:', error);
    return [];
  }
}

export async function getBlogPostAdmin(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('portfolio_posts')
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
      content: data.content,
    };
  } catch (error) {
    console.error(`Error fetching admin blog post ${slug}:`, error);
    return null;
  }
}

export async function upsertBlogPost(
  post: DbBlogPostInsert
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('portfolio_posts')
      .upsert(post, { onConflict: 'slug' });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function updateBlogPostFields(
  slug: string,
  updates: DbBlogPostUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('portfolio_posts')
      .update(updates)
      .eq('slug', slug);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteBlogPost(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('portfolio_posts')
      .delete()
      .eq('slug', slug);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}