import { AlertTriangle, BookOpen } from "lucide-react";
import { getBlogPostsSummaryWithStatus } from "@/lib/blog";
import { EmptyState } from "@/components/ui/empty-state";
import { LatestPostsGrid } from "@/components/home/latest-posts-grid";

export async function LatestPosts() {
  const { data: allPosts, error } = await getBlogPostsSummaryWithStatus();

  // Extract featured posts
  const featuredPosts = allPosts.filter((p) => p.featured);

  // Pad with latest non-featured posts to reach 3 if needed
  const nonFeaturedPosts = allPosts.filter((p) => !p.featured);

  let latestPosts = [...featuredPosts];
  if (latestPosts.length < 3) {
    const remainingNeeded = 3 - latestPosts.length;
    latestPosts = [...latestPosts, ...nonFeaturedPosts.slice(0, remainingNeeded)];
  } else {
    latestPosts = latestPosts.slice(0, 3);
  }

  return (
    <section className="w-full py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {error ? (
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12 text-primary" />}
            title="Having trouble loading this"
            description="Something went wrong on our end. This isn't an empty portfolio, just a temporary hiccup. Please check back shortly."
            actionText="Check back soon"
          />
        ) : latestPosts.length === 0 ? (
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
