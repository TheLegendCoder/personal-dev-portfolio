import { Layout } from "@/components/layout/layout";
import { BlogCard } from "@/components/blog/blogcard";
import { getBlogPostsSummary } from "@/lib/blog";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen } from "lucide-react";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";

export const metadata = generateSEOMetadata({
  title: "Blog",
  description: "Thoughts, tutorials, and insights about software development, React, TypeScript, and web technologies. Learn from real-world projects and experiments.",
  canonicalUrl: getCanonicalUrl('/blog'),
});

async function BlogPage() {
  const posts = await getBlogPostsSummary();
  const breadcrumbs = generateBreadcrumbs('/blog');

  if (posts.length === 0) {
    return (
      <Layout>
        <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4">
                Blog
              </h1>

              <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

              <p className="text-lg text-muted-foreground">
                Thoughts, tutorials, and insights about software development.
              </p>
            </div>
            <EmptyState
              icon={<BookOpen className="h-12 w-12 text-primary" />}
              title="Blog posts coming soon"
              description="I'm working on some insightful articles about web development, design patterns, and best practices. Check back soon for in-depth tutorials and technical insights."
              actionText="Check back soon"
            />
          </div>
        </section>
      </Layout>
    );
  }

  const [featuredPost, ...restPosts] = posts;

  return (
    <Layout>
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4">
              Blog
            </h1>

            <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

            <p className="text-lg text-muted-foreground">
              Thoughts, tutorials, and insights about software development, React, and modern web
              technologies.
            </p>
          </div>

          {/* Featured-first bento — sized exactly to the current post count, no empty cells */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <BlogCard
                id={featuredPost.slug}
                title={featuredPost.title}
                excerpt={featuredPost.description}
                image={featuredPost.image}
                date={featuredPost.date}
                readTime={featuredPost.readTime}
                category={featuredPost.tags[0] || "Article"}
                large
              />
            </div>
            {restPosts.map((post) => (
              <BlogCard
                key={post.slug}
                id={post.slug}
                title={post.title}
                excerpt={post.description}
                image={post.image}
                date={post.date}
                readTime={post.readTime}
                category={post.tags[0] || "Article"}
              />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default BlogPage;
