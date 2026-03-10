'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { markdownToHtml } from '@/lib/markdown';
import { createClient, createServiceClient, createAnonClient } from '@/lib/supabase/server';
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

// ---------------------------------------------------------------------------
// Tutorials — still file-based (unchanged)
// ---------------------------------------------------------------------------

export async function getTutorial(slug: string): Promise<BlogPost | null> {
  try {
    // Check for both .mdx and .md files
    const mdxPath = path.join(tutorialsDirectory, `${slug}.mdx`);
    const mdPath = path.join(tutorialsDirectory, `${slug}.md`);
    const fullPath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const htmlContent = await markdownToHtml(content);
    
    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      tags: data.tags || [],
      readTime: data.readTime,
      published: data.published || false,
      featured: data.featured || false,
      image: data.image,
      imageHint: data.imageHint,
      content: htmlContent,
    };
  } catch (error) {
    console.error(`Error reading tutorial ${slug}:`, error);
    return null;
  }
}

export async function getAllTutorials(): Promise<BlogPost[]> {
  try {
    const fileNames = fs.readdirSync(tutorialsDirectory);
    const allTutorialsData = await Promise.all(
      fileNames
        .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
        .map(async (fileName) => {
          const slug = fileName.replace(/\.(md|mdx)$/, '');
          return await getTutorial(slug);
        })
    );
    
    return allTutorialsData
      .filter((post): post is BlogPost => post !== null && post.published)
      .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
  } catch (error) {
    console.error('Error reading tutorials:', error);
    return [];
  }
}
