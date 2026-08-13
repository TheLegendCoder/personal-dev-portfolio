import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Code2 } from 'lucide-react';
import { getProjects, getProjectsByCategory } from '@/lib/projects';
import type { ProjectCategory } from '@/lib/projects';
import { ProjectCard } from '@/components/projects/projectcards';
import { ProjectFilters } from '@/components/projects/project-filters';
import { EmptyState } from '@/components/ui/empty-state';
import { BreadcrumbWithSchema } from '@/components/ui/breadcrumb';
import { generateBreadcrumbs } from '@/lib/seo/breadcrumbs';

export const dynamic = 'force-dynamic';

interface ProjectsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { category } = await searchParams;

  const validCategories = ['all', 'professional', 'personal'];
  if (!category || !validCategories.includes(category)) {
    redirect('/projects?category=all');
  }

  const projects =
    category === 'all'
      ? await getProjects()
      : await getProjectsByCategory(category as ProjectCategory);

  const breadcrumbs = generateBreadcrumbs('/projects');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4 max-w-3xl">
            My Projects
          </h1>

          <BreadcrumbWithSchema items={breadcrumbs} className="mb-6" />

          <p className="text-lg text-muted-foreground max-w-2xl mb-10">
            A collection of my professional work and personal projects showcasing my skills in
            web development, design, and problem-solving.
          </p>

          <Suspense fallback={null}>
            <ProjectFilters current={category} />
          </Suspense>
        </div>
      </section>

      {/* Projects List */}
      <section className="pb-28 lg:pb-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {projects.length === 0 ? (
            <EmptyState
              icon={<Code2 className="h-12 w-12 text-primary" />}
              title="I am working on it."
              description={`Coming soon!${category !== 'all' ? ` No ${category} projects are published yet.` : ''}`}
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
        </div>
      </section>
    </div>
  );
}
