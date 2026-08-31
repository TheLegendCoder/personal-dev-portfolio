'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/projectcards';
import { EmptyState } from '@/components/ui/empty-state';
import { gsap, ScrollTrigger, EASE, STAGGER_CARD, prefersReducedMotion } from '@/lib/gsap';
import type { PortfolioProject } from '@/lib/projects';
import { copy } from '@/components/data/content';

interface FeaturedProjectsClientProps {
  projects: PortfolioProject[];
  error?: boolean;
}

export function FeaturedProjectsClient({ projects, error }: FeaturedProjectsClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set([headerRef.current, ctaRef.current], { y: 0, opacity: 1 });
        if (listRef.current?.children) {
          gsap.set(Array.from(listRef.current.children), { y: 0, opacity: 1 });
        }
        return;
      }

      gsap.from(headerRef.current, {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: EASE,
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%', once: true },
      });

      if (listRef.current?.children) {
        gsap.from(Array.from(listRef.current.children), {
          y: 60,
          opacity: 0,
          duration: 0.85,
          ease: EASE,
          stagger: STAGGER_CARD,
          scrollTrigger: { trigger: listRef.current, start: 'top 82%', once: true },
        });
      }

      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: EASE,
          scrollTrigger: { trigger: ctaRef.current, start: 'top 92%', once: true },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-28 lg:py-36 px-4 sm:px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <h2
          ref={headerRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-foreground mb-16 lg:mb-20 max-w-2xl"
        >
          Featured Projects
        </h2>

        {error ? (
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12 text-primary" />}
            title="Having trouble loading this"
            description={copy.loadError}
            actionText="Check back soon"
          />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<Code2 className="h-12 w-12 text-primary" />}
            title="I am working on it."
            description={copy.projectsEmptyState}
            actionText="Check back soon"
          />
        ) : (
          <>
            <div ref={listRef} className="flex flex-col gap-16 lg:gap-24">
              {projects.map((project, i) => (
                <div key={project.id} className={i % 2 === 1 ? 'lg:ml-16' : undefined}>
                  <ProjectCard
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
                </div>
              ))}
            </div>

            <div ref={ctaRef} className="mt-16">
              <Button asChild variant="outline" size="lg" className="group">
                <Link href="/projects">
                  View All Projects
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
