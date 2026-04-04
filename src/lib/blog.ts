'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { markdownToHtml } from '@/lib/markdown';
import { createServiceClient, createAnonClient } from '@/lib/supabase/server';
import type { DbBlogPostInsert, DbBlogPostUpdate } from '@/lib/supabase/types';

export interface BlogPost {
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
  content: string;
}

// ---------------------------------------------------------------------------
// Tutorials are still file-based (unchanged)
// ---------------------------------------------------------------------------
const tutorialsDirectory = path.join(process.cwd(), 'src/content/tutorial');

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

export type BlogPostSummary = Omit<BlogPost, 'content'>;

export async function getTopBlogPosts(limit: number = 3): Promise<BlogPostSummary[]> {
  try {
    const supabase = createAnonClient();

    // First, try to get featured posts
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

    let posts = featuredData || [];

    // If there are no featured posts, fall back to recent posts
    if (posts.length === 0) {
      const { data: recentData, error: recentError } = await supabase
        .from('portfolio_posts')
        .select('slug, title, description, date, author, tags, read_time, published, featured, image, image_hint')
        .eq('published', true)
        .order('date', { ascending: false })
        .limit(limit);

      if (recentError) {
        console.error('Error fetching recent blog posts:', recentError);
      } else if (recentData) {
        // If there were no featured posts at all, just use the recent posts directly
        posts = recentData;
      }
    }

    return posts.map((row) => ({
export async function getBlogPostsSummary(): Promise<Omit<BlogPost, 'content'>[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_posts')
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
    console.error('Error fetching top blog posts:', error);
    console.error('Error fetching blog post summaries:', error);
    return [];
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('portfolio_posts')
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
        } as BlogPost;
      })
    );

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Admin blog API — reads all posts (no published filter), uses service role
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
      content: row.content, // raw markdown for admin
    }));
  } catch (error) {
    console.error('Error fetching admin blog posts:', error);
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
      content: data.content, // raw markdown for admin
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

