import { Layout } from '@/components/layout/layout';
import { generateSEOMetadata, getCanonicalUrl } from '@/lib/seo/metadata';
import { BreadcrumbWithSchema } from '@/components/ui/breadcrumb';
import { generateBreadcrumbs } from '@/lib/seo/breadcrumbs';
import { personalInfo } from '@/components/data/content';

export const metadata = generateSEOMetadata({
  title: 'Privacy Policy',
  description: 'How this site collects and uses data.',
  canonicalUrl: getCanonicalUrl('/privacy'),
});

export default function PrivacyPage() {
  const breadcrumbs = generateBreadcrumbs('/privacy');

  return (
    <Layout>
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-foreground mb-4">
              Privacy Policy
            </h1>
            <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />
            <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">What this site is</h2>
              <p className="text-muted-foreground">
                This is {personalInfo.name}&apos;s personal portfolio and blog. There
                are no user accounts, no public forms, and nothing you submit is
                stored — the &quot;contact&quot; links in the footer just open your
                email client or an external profile (GitHub, LinkedIn, X).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Analytics cookies</h2>
              <p className="text-muted-foreground">
                With your consent, this site uses{' '}
                <a href="https://posthog.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                  PostHog
                </a>{' '}
                to understand how visitors use the site — pages viewed, general
                interactions, and when a visit ends. This data is anonymized
                where possible and is never sold or shared with third parties for
                advertising. PostHog is not loaded until you accept cookies in the
                banner; if you reject or ignore it, no analytics cookies are set.
              </p>
              <p className="text-muted-foreground mt-3">
                You can change your choice at any time using the &quot;Cookie
                preferences&quot; link in the footer.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Essential cookies</h2>
              <p className="text-muted-foreground">
                A small number of strictly necessary cookies (e.g. your
                light/dark theme choice, and an admin session cookie used only on
                the restricted content-management area) are used regardless of
                consent, as they don&apos;t track you across sites.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Questions</h2>
              <p className="text-muted-foreground">
                Reach out via any of the links in the footer if you have
                questions about this policy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
