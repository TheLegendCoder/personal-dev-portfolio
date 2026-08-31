import { Suspense } from "react";
import { Layout } from "@/components/layout/layout";
import { WritingCard } from "@/components/writing/writing-card";
import { WritingFilters } from "@/components/writing/writing-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { PenLine } from "lucide-react";
import { getAllWriting, getFeaturedWriting } from "@/lib/writing";
import { collectTopics, filterWriting } from "@/lib/writing-utils";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { copy } from "@/components/data/content";

export const dynamic = 'force-dynamic';

export const metadata = generateSEOMetadata({
  title: "Writing",
  description: copy.writingIntro,
  canonicalUrl: getCanonicalUrl('/writing'),
});

interface WritingPageProps {
  searchParams: Promise<{ type?: string; topic?: string }>;
}

async function WritingPage({ searchParams }: WritingPageProps) {
  const { type = 'all', topic = '' } = await searchParams;

  const [all, featured] = await Promise.all([
    getAllWriting(),
    getFeaturedWriting(3),
  ]);

  const breadcrumbs = generateBreadcrumbs('/writing');
  const topics = collectTopics(all);
  const isFiltered = (type !== 'all' && type !== '') || topic !== '';

  // Featured pieces are pinned above the fold and stay put regardless of how
  // old they are — that is the whole point of the flag. They are excluded from
  // Latest so the same card never appears twice on an unfiltered view.
  const featuredHrefs = new Set(featured.map((item) => item.href));
  const latest = filterWriting(all, { type, topic }).filter(
    (item) => isFiltered || !featuredHrefs.has(item.href)
  );

  return (
    <Layout>
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4">
              Writing
            </h1>

            <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

            <p className="text-lg text-muted-foreground">
              {copy.writingIntro}
            </p>
          </div>

          {all.length === 0 ? (
            <EmptyState
              icon={<PenLine className="h-12 w-12 text-primary" />}
              title="Writing coming soon"
              description={copy.writingEmptyState}
              actionText="Check back soon"
            />
          ) : (
            <>
              {/* Featured — honours the `featured` flag in the CMS rather than
                  simply leading with the newest item. */}
              {featured.length > 0 && (
                <div className="mb-20">
                  <h2 className="mono-label mb-8 border-b border-border pb-3 text-foreground">
                    Featured
                  </h2>
                  <div className="flex flex-col gap-16 lg:gap-24">
                    {featured.map((item, i) => (
                      <WritingCard
                        key={item.href}
                        item={item}
                        large={i === 0}
                        featuredPosition={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Latest + filters */}
              <div>
                <div className="mb-8 flex flex-col gap-6 border-b border-border pb-6">
                  <h2 className="mono-label text-foreground">
                    {isFiltered ? 'Results' : 'Latest'}
                  </h2>
                  <Suspense fallback={null}>
                    <WritingFilters
                      currentType={type}
                      currentTopic={topic}
                      topics={topics}
                    />
                  </Suspense>
                </div>

                {latest.length === 0 ? (
                  <EmptyState
                    icon={<PenLine className="h-12 w-12 text-primary" />}
                    title="Nothing matches those filters"
                    description="Try a different topic, or clear the filters to see everything I've written."
                    actionText="Adjust your filters"
                  />
                ) : (
                  <div className="flex flex-col gap-16 lg:gap-24">
                    {latest.map((item) => (
                      <WritingCard key={item.href} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default WritingPage;
