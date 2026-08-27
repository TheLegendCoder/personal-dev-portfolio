import { Layout } from '@/components/layout/layout';
import { BlogCard } from '@/components/blog/blogcard';
import { TutorialCard } from '@/components/tutorial/tutorialcard';
import { WritingTabs } from '@/components/writing/writing-tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { BookOpen } from 'lucide-react';
import { getUnifiedWriting, filterWritingByType } from '@/lib/writing';
import type { WritingItem, WritingType } from '@/lib/writing';
import { generateSEOMetadata, getCanonicalUrl } from '@/lib/seo/metadata';
import { BreadcrumbWithSchema } from '@/components/ui/breadcrumb';
import { generateBreadcrumbs } from '@/lib/seo/breadcrumbs';

export const dynamic = 'force-dynamic';

export const metadata = generateSEOMetadata({
  title: 'Writing',
  description:
    'Ideas, lessons, and engineering perspective from building real software — articles and step-by-step tutorials in one place.',
  canonicalUrl: getCanonicalUrl('/writing'),
});

/** `?type=` values are plural for readability in the URL; the data uses singular. */
const TYPE_PARAM: Record<string, WritingType> = {
  articles: 'article',
  tutorials: 'tutorial',
};

interface WritingPageProps {
  searchParams: Promise<{ type?: string }>;
}

/** Renders the right card for the item's type, with a real type label. */
function WritingCard({ item, large }: { item: WritingItem; large?: boolean }) {
  const Card = item.type === 'tutorial' ? TutorialCard : BlogCard;

  return (
    <Card
      id={item.slug}
      title={item.title}
      excerpt={item.description}
      image={item.image}
      date={item.date}
      readTime={item.readTime}
      category={item.type === 'tutorial' ? 'Tutorial' : 'Article'}
      large={large}
    />
  );
}

export default async function WritingPage({ searchParams }: WritingPageProps) {
  const { type } = await searchParams;
  // An unrecognised (or absent) ?type= falls back to the full list rather than
  // redirecting — "no filter" is a legitimate state here.
  const activeType: WritingType | 'all' = (type ? TYPE_PARAM[type] : undefined) ?? 'all';

  const allItems = await getUnifiedWriting();
  const items = filterWritingByType(allItems, activeType);
  const featured = items.filter((item) => item.featured);
  const rest = items.filter((item) => !item.featured);

  const breadcrumbs = generateBreadcrumbs('/writing');

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
              Ideas, lessons, and engineering perspective from building real software.
            </p>
          </div>

          <div className="mb-16">
            <WritingTabs current={activeType} />
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-12 w-12 text-primary" />}
              title="Nothing here yet"
              description="I'm working on articles and step-by-step tutorials about web development, architecture, and the lessons that come out of building real software."
              actionText="Check back soon"
            />
          ) : (
            <>
              {/* Featured row — pinned above the chronological list. */}
              {featured.length > 0 && (
                <div className="mb-16 lg:mb-24">
                  <h2 className="mono-label mb-8 pb-3 border-b border-border">Featured</h2>
                  <div className="flex flex-col gap-16 lg:gap-24">
                    {featured.map((item, i) => (
                      <WritingCard key={`${item.type}-${item.slug}`} item={item} large={i === 0} />
                    ))}
                  </div>
                </div>
              )}

              {/* Everything else, newest first. */}
              {rest.length > 0 && (
                <div className="flex flex-col gap-16 lg:gap-24">
                  {rest.map((item, i) => (
                    <WritingCard
                      key={`${item.type}-${item.slug}`}
                      item={item}
                      large={featured.length === 0 && i === 0}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
