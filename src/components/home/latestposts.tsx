import { BookOpen } from "lucide-react";
import { getAllBlogPostsSummary } from "@/lib/blog";
import { EmptyState } from "@/components/ui/empty-state";
import { LatestPostsGrid } from "@/components/home/latest-posts-grid";

export async function LatestPosts() {
  const allPosts = await getAllBlogPostsSummary();

  // Show featured posts first (up to 3); fall back to the 3 most-recent if none are featured
  const featuredPosts = allPosts.filter((p) => p.featured);
  const latestPosts = featuredPosts.length > 0 ? featuredPosts.slice(0, 3) : allPosts.slice(0, 3);

  return (
    <section className="w-full py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {latestPosts.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-12 w-12 text-primary" />}
            title="Blog posts coming soon"
            description="I'm working on insightful articles about web development, design patterns, and best practices. Check back soon for in-depth tutorials and technical insights."
            actionText="Check back soon"
          />
        ) : (
          <LatestPostsGrid posts={latestPosts} />
        )}
      </div>
    </section>
  );
}
