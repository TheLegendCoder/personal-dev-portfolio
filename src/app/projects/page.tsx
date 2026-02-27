import { Suspense } from 'react';
import { Code2 } from 'lucide-react';
import { getProjects, getProjectsByCategory } from '@/lib/projects';
import type { ProjectCategory } from '@/lib/projects';
import { ProjectCard } from '@/components/projects/projectcards';
import { ProjectFilters } from '@/components/projects/project-filters';
import { EmptyState } from '@/components/ui/empty-state';
import { StaggerContainer } from '@/components/ui/stagger';
import { BreadcrumbWithSchema } from '@/components/ui/breadcrumb';
import { generateBreadcrumbs } from '@/lib/seo/breadcrumbs';

interface ProjectsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { category } = await searchParams;
  const validCategory =
    category === 'professional' || category === 'personal'
      ? (category as ProjectCategory)
      : undefined;

  const projects = validCategory
    ? await getProjectsByCategory(validCategory)
    : await getProjects();

  const breadcrumbs = generateBreadcrumbs('/projects');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex flex-col items-center text-center mb-12 lg:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-secondary mb-4 animate-fade-in">
              My Projects
            </h1>

            <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl animate-fade-in">
              A collection of my professional work and personal projects showcasing my skills in
              web development, design, and problem-solving.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex justify-center mb-12 lg:mb-16">
            <Suspense fallback={null}>
              <ProjectFilters current={validCategory ?? ''} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {projects.length === 0 ? (
            <EmptyState
              icon={<Code2 className="h-12 w-12 text-primary" />}
              title="Projects on the way"
              description={`More ${validCategory ?? ''} projects coming soon. Check back soon.`}
              actionText="Check back soon"
            />
          ) : (
            <StaggerContainer
              variant="slide-up"
              delayChildren={0}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"
            >
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
            </StaggerContainer>
          )}
        </div>
      </section>
    </div>
  );
}
