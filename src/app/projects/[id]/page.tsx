import { getProjects, getPublishedProjectById } from "@/lib/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateProjectBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getPublishedProjectById(id);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The project you're looking for doesn't exist.",
    };
  }

  return generateSEOMetadata({
    title: project.title,
    description: project.description,
    image: project.image,
    imageAlt: project.image_hint || project.title,
    type: 'website',
    tags: project.tags,
    canonicalUrl: getCanonicalUrl(`/projects/${id}`),
  });
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const [project, allProjects] = await Promise.all([
    getPublishedProjectById(id),
    getProjects(),
  ]);

  if (!project) {
    notFound();
  }

  const breadcrumbs = generateProjectBreadcrumbs(project.title);

  // Prev/next, wrapping around — deliberately not a "related projects" grid,
  // which would look empty with only a handful of real projects.
  const currentIndex = allProjects.findIndex((p) => p.id === id);
  const nextProject =
    currentIndex >= 0 && allProjects.length > 1
      ? allProjects[(currentIndex + 1) % allProjects.length]
      : null;

  return (
    <article className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {project.category && (
              <span>{project.category === 'professional' ? 'Professional' : 'Personal'}</span>
            )}
            {project.featured && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-primary">Featured</span>
              </>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4">
            {project.title}
          </h1>

          <BreadcrumbWithSchema items={breadcrumbs} className="mb-6" />

          <p className="text-lg text-muted-foreground max-w-2xl">
            {project.description}
          </p>
        </header>

        {project.image && (
          <div className="mb-10 overflow-hidden bg-muted">
            <Image
              src={project.image}
              alt={project.image_hint || project.title}
              width={1600}
              height={900}
              sizes="(max-width: 1024px) 100vw, 896px"
              className="w-full h-auto object-cover aspect-video"
              priority
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-16">
          {project.live_url && project.live_url !== '#' && (
            <Button asChild size="lg">
              <Link href={project.live_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Live Site
              </Link>
            </Button>
          )}
          {project.github_url && (
            <Button asChild variant="outline" size="lg">
              <Link href={project.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                View Source
              </Link>
            </Button>
          )}
        </div>

        {nextProject && (
          <footer className="pt-8 border-t border-border">
            <Link
              href={`/projects/${nextProject.id}`}
              className="group flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Next project
                </p>
                <p className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                  {nextProject.title}
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </footer>
        )}
      </div>
    </article>
  );
}
