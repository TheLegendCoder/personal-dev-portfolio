import { getAllBlogPosts } from './src/lib/blog';

async function run() {
  const start = performance.now();
  const allPosts = await getAllBlogPosts();
  const end = performance.now();

  console.log(`Fetched ${allPosts.length} posts in ${end - start}ms`);
}

run().catch(console.error);
