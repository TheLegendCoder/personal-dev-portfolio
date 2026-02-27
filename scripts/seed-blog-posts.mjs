/**
 * Seed script — migrates existing file-based blog posts into Supabase.
 * Run once after filling in .env.local:
 *
 *   node scripts/seed-blog-posts.mjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import matter from 'gray-matter';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, '..', 'src', 'content', 'blog');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  const files = fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

  console.log(`Found ${files.length} post(s) to migrate…\n`);

  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/, '');
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data, content } = matter(raw);

    const row = {
      slug,
      title: data.title ?? '',
      description: data.description ?? '',
      date: data.date ? String(data.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      author: data.author ?? '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      read_time: data.readTime ?? '',
      published: data.published ?? false,
      featured: data.featured ?? false,
      image: data.image ?? '',
      image_hint: data.imageHint ?? '',
      content: content.trim(),
    };

    const { error } = await supabase
      .from('portfolio_posts')
      .upsert(row, { onConflict: 'slug' });

    if (error) {
      console.error(`  ✗ Failed to insert "${slug}":`, error.message);
    } else {
      console.log(`  ✓ Inserted "${slug}"`);
    }
  }

  console.log('\nDone.');
}

seed().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
