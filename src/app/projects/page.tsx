import { Code2 } from 'lucide-react';
import { getProjects } from '@/lib/projects';
import type { PortfolioProject } from '@/lib/projects';
import { ProjectCard } from '@/components/projects/projectcards';
import { EmptyState } from '@/components/ui/empty-state';
import { BreadcrumbWithSchema } from '@/components/ui/breadcrumb';
import { generateBreadcrumbs } from '@/lib/seo/breadcrumbs';

export const dynamic = 'force-dynamic';

/**
 * Three buckets instead of category filter tabs. `is_experiment` is orthogonal
 * to `category` — an experiment keeps being 'professional' or 'personal', it
 * just groups here instead. Experiments are pulled out first so a featured
 * experiment lands under Experiments rather than appearing twice.
 */
function groupProjects(projects: PortfolioProject[]) {
  const experiments = projects.filter((p) => p.is_experiment);
  const rest = projects.filter((p) => !p.is_experiment);

  return {
    featured: rest.filter((p) => p.featured),
    side: rest.filter((p) => !p.featured),
    experiments,
  };
}

function ProjectSection({
  title,
  projects,
}: {
  title: string;
  projects: PortfolioProject[];
}) {
  // Empty buckets render nothing at all — the page grows into three sections as
  // projects get curated, rather than showing empty headings in the meantime.
  if (projects.length === 0) return null;

  return (
    <section className="mb-16 lg:mb-24 last:mb-0">
      <h2 className="mono-label mb-8 pb-3 border-b border-border">{title}</h2>
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
            isExperiment={project.is_experiment}
          />
        ))}
      </div>
    </section>
  );
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  const { featured, side, experiments } = groupProjects(projects);
  const breadcrumbs = generateBreadcrumbs('/projects');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4 max-w-3xl">
            Work
          </h1>

          <BreadcrumbWithSchema items={breadcrumbs} className="mb-6" />

          <p className="text-lg text-muted-foreground max-w-2xl">
            Things I&apos;ve built — client and professional work, side projects, and
            smaller experiments worth keeping around.
          </p>
        </div>
      </section>

      {/* Grouped project list */}
      <section className="pb-28 lg:pb-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {projects.length === 0 ? (
            <EmptyState
              icon={<Code2 className="h-12 w-12 text-primary" />}
              title="I am working on it."
              description="Coming soon!"
              actionText="Check back soon"
            />
          ) : (
            <>
              <ProjectSection title="Featured" projects={featured} />
              <ProjectSection title="Side Projects" projects={side} />
              <ProjectSection title="Experiments" projects={experiments} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
