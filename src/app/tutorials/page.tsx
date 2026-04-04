import { Layout } from "@/components/layout/layout";
import { TutorialCard } from "@/components/tutorial/tutorialcard";
import { getAllTutorialsSummary } from "@/lib/tutorial";
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
  const tutorials = await getAllTutorialsSummary();
  const tutorials = await getTutorialsSummary();
  const breadcrumbs = generateBreadcrumbs('/tutorials');

  if (tutorials.length === 0) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
                Tutorials
              </h1>
              
              {/* Breadcrumb Navigation */}
              <div className="flex justify-center mb-4">
                <BreadcrumbWithSchema items={breadcrumbs} />
              </div>
              
              <p className="text-muted-foreground max-w-2xl mx-auto">
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

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Tutorials
            </h1>
            
            {/* Breadcrumb Navigation */}
            <div className="flex justify-center mb-4">
              <BreadcrumbWithSchema items={breadcrumbs} />
            </div>
            
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Step-by-step guides to help you learn and grow as a developer. Master web development,
              design patterns, and advanced techniques.
            </p>
          </div>

          {/* Tutorials Grid - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutorials.map((tutorial) => (
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
