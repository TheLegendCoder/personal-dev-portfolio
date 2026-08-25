import Link from "next/link";
import { Layout } from "@/components/layout/layout";
import { BlogCard } from "@/components/blog/blogcard";
import { getBlogPostsSummary } from "@/lib/blog";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen } from "lucide-react";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { copy } from "@/components/data/content";

export const metadata = generateSEOMetadata({
  title: "Blog",
  description: copy.blogMetaDescription,
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
                {copy.blogIntro}
              </p>
            </div>
            <EmptyState
              icon={<BookOpen className="h-12 w-12 text-primary" />}
              title="Blog posts coming soon"
              description={copy.writingEmptyState}
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
              {copy.blogIntro}
            </p>

            <Link
              href="/writing"
              className="mono-label mt-6 inline-flex items-center border-b border-primary pb-1 text-primary transition-colors hover:text-primary/80"
            >
              See all writing →
            </Link>
          </div>

          {/* Editorial stacked list — matches /projects; the lead post gets
              the clip-corner accent, everything else is a plain row. */}
          <div className="flex flex-col gap-16 lg:gap-24">
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
