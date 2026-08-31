'use server';

import { createServiceClient, createAnonClient } from '@/lib/supabase/server';
import type { DbBlogPostInsert, DbBlogPostUpdate } from '@/lib/supabase/types';
import { withSummaryColumns } from '@/lib/supabase/columns';

type MarkdownToHtml = (markdown: string) => Promise<string>;

let markdownToHtmlFn: MarkdownToHtml | null = null;

async function renderMarkdown(markdown: string): Promise<string> {
  if (!markdownToHtmlFn) {
    const markdownModule = await import('@/lib/markdown');
    markdownToHtmlFn = markdownModule.markdownToHtml;
  }
  return markdownToHtmlFn(markdown);
}

interface BlogPostBase {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  /** Curated subset of tags mapping onto src/lib/taxonomy.ts */
  topics: string[];
  evergreen: boolean;
  readTime: string;
  published: boolean;
  featured: boolean;
  image: string;
  imageHint: string;
  relatedPostSlugs: string[];
  relatedTutorialSlugs: string[];
  relatedProjectSlugs: string[];
}

export type BlogPostSummary = BlogPostBase;
export type BlogPostSitemap = Pick<BlogPostBase, 'slug' | 'date'>;

export interface BlogPost extends BlogPostBase {
  content: string;
}

interface BlogPostRow {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[] | null;
  // Nullable in the mapper because the Stage 2 columns only exist once the
  // migrations in supabase/migrations/ have been applied.
  topics?: string[] | null;
  evergreen?: boolean | null;
  read_time: string;
  published: boolean;
  featured: boolean;
  image: string;
  image_hint: string;
  related_post_slugs?: string[] | null;
  related_tutorial_slugs?: string[] | null;
  related_project_slugs?: string[] | null;
}

function mapBlogPostSummary(row: BlogPostRow): BlogPostSummary {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: row.date,
    author: row.author,
    tags: row.tags ?? [],
    topics: row.topics ?? [],
    evergreen: row.evergreen ?? false,
    readTime: row.read_time,
    published: row.published,
    featured: row.featured,
    image: row.image,
    imageHint: row.image_hint,
    relatedPostSlugs: row.related_post_slugs ?? [],
    relatedTutorialSlugs: row.related_tutorial_slugs ?? [],
    relatedProjectSlugs: row.related_project_slugs ?? [],
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

    const htmlContent = await renderMarkdown(data.content);

    return {
      slug: data.slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      tags: data.tags ?? [],
      topics: data.topics ?? [],
      evergreen: data.evergreen ?? false,
      readTime: data.read_time,
      published: data.published,
      featured: data.featured,
      image: data.image,
      imageHint: data.image_hint,
      relatedPostSlugs: data.related_post_slugs ?? [],
      relatedTutorialSlugs: data.related_tutorial_slugs ?? [],
      relatedProjectSlugs: data.related_project_slugs ?? [],
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

    const { data: featuredData, error: featuredError } = await withSummaryColumns((columns) =>
      supabase
        .from('portfolio_posts')
        .select(columns)
        .eq('published', true)
        .eq('featured', true)
        .order('date', { ascending: false })
        .limit(limit)
    );

    if (featuredError) {
      console.error('Error fetching featured blog posts:', featuredError);
      return [];
    }

    let posts = featuredData ?? [];

    if (posts.length === 0) {
      const { data: recentData, error: recentError } = await withSummaryColumns((columns) =>
        supabase
          .from('portfolio_posts')
          .select(columns)
          .eq('published', true)
          .order('date', { ascending: false })
          .limit(limit)
      );

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

async function fetchBlogPostsSummary(): Promise<{ data: BlogPostSummary[]; error: boolean }> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await withSummaryColumns((columns) =>
      supabase
        .from('portfolio_posts')
        .select(columns)
        .eq('published', true)
        .order('date', { ascending: false })
    );

    if (error) {
      console.error('Error fetching blog post summaries:', error.message);
      return { data: [], error: true };
    }
    if (!data) return { data: [], error: false };

    return { data: data.map(mapBlogPostSummary), error: false };
  } catch (error) {
    console.error('Error fetching blog post summaries:', error);
    return { data: [], error: true };
  }
}

export async function getBlogPostsSummary(): Promise<BlogPostSummary[]> {
  const { data } = await fetchBlogPostsSummary();
  return data;
}

/**
 * Same query as getBlogPostsSummary, but preserves whether the fetch itself
 * failed vs. genuinely returned no rows — used on the home page so a Supabase
 * outage doesn't render identically to "nothing published yet".
 */
export async function getBlogPostsSummaryWithStatus(): Promise<{ data: BlogPostSummary[]; error: boolean }> {
  return fetchBlogPostsSummary();
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
      topics: row.topics ?? [],
      evergreen: row.evergreen ?? false,
      readTime: row.read_time,
      published: row.published,
      featured: row.featured,
      image: row.image,
      imageHint: row.image_hint,
      relatedPostSlugs: row.related_post_slugs ?? [],
      relatedTutorialSlugs: row.related_tutorial_slugs ?? [],
      relatedProjectSlugs: row.related_project_slugs ?? [],
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
    const { data, error } = await withSummaryColumns((columns) =>
      supabase
        .from('portfolio_posts')
        .select(columns)
        .order('date', { ascending: false })
    );

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
      topics: data.topics ?? [],
      evergreen: data.evergreen ?? false,
      readTime: data.read_time,
      published: data.published,
      featured: data.featured,
      image: data.image,
      imageHint: data.image_hint,
      relatedPostSlugs: data.related_post_slugs ?? [],
      relatedTutorialSlugs: data.related_tutorial_slugs ?? [],
      relatedProjectSlugs: data.related_project_slugs ?? [],
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