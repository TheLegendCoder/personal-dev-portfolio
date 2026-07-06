'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProjectCardSkeleton } from '@/components/ui/skeleton';
import { getProjects, type PortfolioProject } from '@/lib/projects';

export function ProjectsPanel() {
  const [projects, setProjects] = useState<PortfolioProject[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProjects().then((data) => {
      if (!cancelled) setProjects(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (projects === null) {
    return (
      <div className="h-full overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No published projects yet.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background p-4">
      <div className="mb-3 font-mono text-xs text-muted-foreground">
        {projects.length} project{projects.length === 1 ? '' : 's'}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="relative rounded-xl border border-border bg-card p-4"
          >
            {project.featured && (
              <span className="absolute right-3 top-3 rounded-md border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-600 dark:text-amber-400">
                featured
              </span>
            )}
            <div className="mb-2 pr-14 font-semibold text-foreground">{project.title}</div>
            <p className="mb-3 line-clamp-3 text-xs text-muted-foreground">
              {project.description}
            </p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {project.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 text-xs">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-medium text-primary hover:bg-primary/20"
                >
                  <ExternalLink className="h-3 w-3" /> Live
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-md border border-border px-2 py-1 font-medium text-foreground hover:bg-muted"
                >
                  <Github className="h-3 w-3" /> GitHub
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
