import Link from "next/link";
import { Layout } from "@/components/layout/layout";
import { TutorialCard } from "@/components/tutorial/tutorialcard";
import { getTutorialsSummary } from "@/lib/tutorial";
import { EmptyState } from "@/components/ui/empty-state";
import { Lightbulb } from "lucide-react";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { copy } from "@/components/data/content";

export const metadata = generateSEOMetadata({
  title: "Tutorials",
  description: copy.tutorialsMetaDescription,
  canonicalUrl: getCanonicalUrl('/tutorials'),
});

async function TutorialsPage() {
  const tutorials = await getTutorialsSummary();
  const breadcrumbs = generateBreadcrumbs('/tutorials');

  if (tutorials.length === 0) {
    return (
      <Layout>
        <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4">
                Tutorials
              </h1>

              <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

              <p className="text-lg text-muted-foreground">
                {copy.tutorialsIntro}
              </p>
            </div>
            <EmptyState
              icon={<Lightbulb className="h-12 w-12 text-primary" />}
              title="Tutorials on the way"
              description={copy.tutorialsEmptyState}
              actionText="Check back soon"
            />
          </div>
        </section>
      </Layout>
    );
  }

  const [featuredTutorial, ...restTutorials] = tutorials;

  return (
    <Layout>
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4">
              Tutorials
            </h1>

            <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

            <p className="text-lg text-muted-foreground">
              {copy.tutorialsIntro}
            </p>

            <Link
              href="/writing"
              className="mono-label mt-6 inline-flex items-center border-b border-primary pb-1 text-primary transition-colors hover:text-primary/80"
            >
              See all writing →
            </Link>
          </div>

          {/* Editorial stacked list — matches /projects; the lead tutorial gets
              the clip-corner accent, everything else is a plain row. */}
          <div className="flex flex-col gap-16 lg:gap-24">
            <TutorialCard
              id={featuredTutorial.slug}
              title={featuredTutorial.title}
              excerpt={featuredTutorial.description}
              image={featuredTutorial.image}
              date={featuredTutorial.date}
              readTime={featuredTutorial.readTime}
              category={featuredTutorial.tags[0] || "Tutorial"}
              large
            />
            {restTutorials.map((tutorial) => (
              <TutorialCard
                key={tutorial.slug}
                id={tutorial.slug}
                title={tutorial.title}
                excerpt={tutorial.description}
                image={tutorial.image}
                date={tutorial.date}
                readTime={tutorial.readTime}
                category={tutorial.tags[0] || "Tutorial"}
              />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default TutorialsPage;
