import Link from "next/link";
import { notFound } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { WritingCard } from "@/components/writing/writing-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PenLine } from "lucide-react";
import { getAllWriting } from "@/lib/writing";
import { filterByCanonicalTopic } from "@/lib/writing-utils";
import { allTopicSlugs, topicFromSlug } from "@/lib/taxonomy";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";

interface TopicPageProps {
  params: Promise<{ topic: string }>;
}

export async function generateStaticParams() {
  return allTopicSlugs().map(({ slug }) => ({ topic: slug }));
}

export async function generateMetadata({ params }: TopicPageProps) {
  const { topic: slug } = await params;
  const topic = topicFromSlug(slug);

  if (!topic) {
    return generateSEOMetadata({ title: 'Topic not found', noIndex: true });
  }

  return generateSEOMetadata({
    title: `${topic} — Writing`,
    description: `Articles and tutorials about ${topic} — lessons and engineering decisions from building real-world software.`,
    canonicalUrl: getCanonicalUrl(`/writing/topic/${slug}`),
  });
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topic: slug } = await params;
  const topic = topicFromSlug(slug);

  // Only canonical topics get a page — an arbitrary tag in the URL would
  // otherwise mint an indexable, near-empty page for every typo.
  if (!topic) notFound();

  const items = filterByCanonicalTopic(await getAllWriting(), topic);

  const breadcrumbs = generateBreadcrumbs(`/writing/topic/${slug}`, {
    topic: topic,
  });

  return (
    <Layout>
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <p className="mono-label mb-3 text-primary">Topic</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4">
              {topic}
            </h1>

            <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

            <p className="text-lg text-muted-foreground mb-6">
              {items.length === 1
                ? `One piece of writing on ${topic}.`
                : `${items.length} pieces of writing on ${topic}.`}
            </p>

            <Link
              href="/writing"
              className="mono-label inline-flex items-center border-b border-primary pb-1 text-primary transition-colors hover:text-primary/80"
            >
              ← All writing
            </Link>
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={<PenLine className="h-12 w-12 text-primary" />}
              title={`Nothing on ${topic} yet`}
              description="This topic doesn't have any published writing yet. Check back soon, or browse everything else."
              actionText="Check back soon"
            />
          ) : (
            <div className="flex flex-col gap-16 lg:gap-24">
              {items.map((item, i) => (
                <WritingCard key={item.href} item={item} large={i === 0} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
