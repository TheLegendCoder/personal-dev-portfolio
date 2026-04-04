import { Layout } from "@/components/layout/layout";
import { BlogCard } from "@/components/blog/blogcard";
import { getAllBlogPostsSummary } from "@/lib/blog";
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
  const posts = await getAllBlogPostsSummary();
  const posts = await getBlogPostsSummary();
  const breadcrumbs = generateBreadcrumbs('/blog');

  if (posts.length === 0) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
                Blog
              </h1>
              
              {/* Breadcrumb Navigation */}
              <div className="flex justify-center mb-4">
                <BreadcrumbWithSchema items={breadcrumbs} />
              </div>
              
              <p className="text-muted-foreground max-w-2xl mx-auto">
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

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Blog
            </h1>
            
            {/* Breadcrumb Navigation */}
            <div className="flex justify-center mb-4">
              <BreadcrumbWithSchema items={breadcrumbs} />
            </div>
            
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Thoughts, tutorials, and insights about software development, React, and modern web
              technologies.
            </p>
          </div>

          {/* Blog Grid - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
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
