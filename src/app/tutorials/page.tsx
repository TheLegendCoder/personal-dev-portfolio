import { Layout } from "@/components/layout/layout";
import { TutorialCard } from "@/components/tutorial/tutorialcard";
import { getTutorialsSummary } from "@/lib/tutorial";
import { EmptyState } from "@/components/ui/empty-state";
import { Lightbulb } from "lucide-react";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";

export const metadata = generateSEOMetadata({
  title: "Tutorials",
  description: "Step-by-step guides to help you learn and grow as a developer. Comprehensive tutorials covering web development, design patterns, and advanced techniques.",
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
                Step-by-step guides to help you learn and grow as a developer.
              </p>
            </div>
            <EmptyState
              icon={<Lightbulb className="h-12 w-12 text-primary" />}
              title="Tutorials on the way"
              description="I'm creating comprehensive step-by-step guides on web development, best practices, and advanced techniques. These tutorials will help you level up your skills as a developer."
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
              Step-by-step guides to help you learn and grow as a developer. Master web development,
              design patterns, and advanced techniques.
            </p>
          </div>

          {/* Featured-first bento — sized exactly to the current tutorial count, no empty cells */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
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
            </div>
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
