import { Layout } from '@/components/layout/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Compass } from 'lucide-react';
import { nowStatus } from '@/components/data/content';
import { generateSEOMetadata, getCanonicalUrl } from '@/lib/seo/metadata';
import { BreadcrumbWithSchema } from '@/components/ui/breadcrumb';
import { generateBreadcrumbs } from '@/lib/seo/breadcrumbs';

export const metadata = generateSEOMetadata({
  title: 'Now',
  description:
    'What I am building, learning, and exploring at the moment — a short status page, updated every few weeks.',
  canonicalUrl: getCanonicalUrl('/now'),
});

const ROWS: { label: string; key: 'building' | 'learning' | 'exploring' }[] = [
  { label: 'Building', key: 'building' },
  { label: 'Learning', key: 'learning' },
  { label: 'Exploring', key: 'exploring' },
];

export default function NowPage() {
  const rows = ROWS.filter((row) => nowStatus[row.key].trim().length > 0);
  const breadcrumbs = generateBreadcrumbs('/now');

  const formattedUpdatedAt = nowStatus.updatedAt
    ? new Date(nowStatus.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Layout>
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4">
              Now
            </h1>

            <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

            <p className="text-lg text-muted-foreground">
              What I&apos;m working on at the moment. Updated every few weeks.
            </p>
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={<Compass className="h-12 w-12 text-primary" />}
              title="Nothing posted here yet"
              description="This page will hold a short note on what I'm building, learning, and exploring right now."
              actionText="Check back soon"
            />
          ) : (
            <dl className="flex flex-col divide-y divide-border border-t border-border">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 py-6"
                >
                  <dt className="mono-label shrink-0 sm:w-32">{row.label}</dt>
                  <dd className="flex-1 text-lg text-foreground leading-relaxed">
                    {nowStatus[row.key]}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {formattedUpdatedAt && (
            <p className="mt-10 text-xs font-mono text-muted-foreground">
              Last updated {formattedUpdatedAt}
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
}
