import { getBlogPost, getBlogPostsSummary } from "@/lib/blog";
import { Layout } from "@/components/layout/layout";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "highlight.js/styles/atom-one-dark.css";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";
import { generateBlogPostingSchema, generateJSONLD } from "@/lib/seo/structured-data";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBlogPostBreadcrumbs } from "@/lib/seo/breadcrumbs";
import ShareButtons from "@/components/blog/share-buttons";
// @ts-ignore - isomorphic-dompurify doesn't export types but matches DOMPurify
import DOMPurify from "isomorphic-dompurify";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPostsSummary();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The blog post you're looking for doesn't exist.",
    };
  }

  return generateSEOMetadata({
    title: post.title,
    description: post.description,
    image: post.image,
    imageAlt: post.imageHint || post.title,
    type: 'article',
    publishedTime: post.date,
    authors: [post.author],
    tags: post.tags,
    canonicalUrl: getCanonicalUrl(`/blog/${slug}`),
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate BlogPosting structured data
  const blogPostingSchema = generateBlogPostingSchema({
    title: post.title,
    description: post.description,
    url: getCanonicalUrl(`/blog/${slug}`),
    image: post.image,
    datePublished: post.date,
    author: post.author,
    keywords: post.tags,
  });

  // Generate breadcrumbs (simplified: Blog > Post Title)
  const breadcrumbs = generateBlogPostBreadcrumbs(post.title);

  return (
    <Layout>
      {/* BlogPosting Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJSONLD(blogPostingSchema) }}
      />

      <article className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              {post.title}
            </h1>

            {/* Breadcrumb Navigation */}
            <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

            <p className="text-lg text-muted-foreground mb-6">
              {post.description}
            </p>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-6">
              <div>
                <span className="font-semibold text-foreground">{post.author}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <time dateTime={post.date}>{formattedDate}</time>
              <span className="hidden sm:inline">•</span>
              <span>{post.readTime}</span>
            </div>
          </header>

          {/* Featured Image */}
          {post.image && (
            <div className="mb-8 sm:mb-12 rounded-lg overflow-hidden bg-muted">
              <img
                src={post.image}
                alt={post.imageHint || post.title}
                className="w-full h-auto object-cover aspect-video"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-a:text-primary hover:prose-a:text-primary/80 prose-a:underline prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:p-4 prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:pl-6 prose-hr:border-border prose-strong:text-foreground prose-em:text-muted-foreground">
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content),
              }}
            />
          </div>

          {/* Share Buttons */}
          <ShareButtons title={post.title} url={getCanonicalUrl(`/blog/${slug}`)} type="blog" />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <footer className="mt-12 sm:mt-16 pt-8 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </footer>
          )}
        </div>
      </article>
    </Layout>
  );
}
