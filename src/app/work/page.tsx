import Link from "next/link";
import { Code2 } from "lucide-react";
import { getProjectsByCategory } from "@/lib/projects";
import type { PortfolioProject } from "@/lib/projects";
import { ProjectCard } from "@/components/projects/projectcards";
import { EmptyState } from "@/components/ui/empty-state";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";
import { copy } from "@/components/data/content";

export const dynamic = 'force-dynamic';

export const metadata = generateSEOMetadata({
  title: "Work",
  description: copy.workMetaDescription,
  canonicalUrl: getCanonicalUrl('/work'),
});

/**
 * The Work hub splits the single `portfolio_projects` table along its existing
 * `category` column: professional work reads as Projects, personal work reads
 * as Experiments. /projects and /projects/[id] are untouched and still serve
 * every project — this page is an entry point, not a replacement.
 */
function ProjectSection({
  id,
  heading,
  blurb,
  projects,
  emptyDescription,
}: {
  id: string;
  heading: string;
  blurb: string;
  projects: PortfolioProject[];
  emptyDescription: string;
}) {
  return (
    <section id={id} className="pb-24 lg:pb-32">
      <div className="mb-10 border-b border-border pb-4">
        <h2 className="mono-label mb-3 text-foreground">{heading}</h2>
        <p className="max-w-2xl text-muted-foreground">{blurb}</p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<Code2 className="h-12 w-12 text-primary" />}
          title="Nothing published here yet"
          description={emptyDescription}
          actionText="Check back soon"
        />
      ) : (
        <div className="flex flex-col gap-16 lg:gap-24">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              image={project.image}
              tags={project.tags}
              liveUrl={project.live_url}
              githubUrl={project.github_url}
              featured={project.featured}
              category={project.category}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function WorkPage() {
  const [professional, personal] = await Promise.all([
    getProjectsByCategory('professional'),
    getProjectsByCategory('personal'),
  ]);

  const breadcrumbs = generateBreadcrumbs('/work');

  return (
    <div className="min-h-screen bg-background">
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4">
              Work
            </h1>

            <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

            <p className="text-lg text-muted-foreground mb-6">
              {copy.workIntro}
            </p>

            <Link
              href="/projects"
              className="mono-label inline-flex items-center border-b border-primary pb-1 text-primary transition-colors hover:text-primary/80"
            >
              Browse every project →
            </Link>
          </div>

          <ProjectSection
            id="projects"
            heading="Projects"
            blurb="Professional work — systems built for real users, real teams, and real constraints."
            projects={professional}
            emptyDescription="Professional work is on its way here. In the meantime, the experiments below show how I think."
          />

          <ProjectSection
            id="experiments"
            heading="Experiments"
            blurb="Personal builds — smaller, sharper questions I wanted to answer by actually writing the code."
            projects={personal}
            emptyDescription="No experiments published yet. Check back soon."
          />
        </div>
      </section>
    </div>
  );
}
