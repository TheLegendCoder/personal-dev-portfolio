'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/projectcards';
import { EmptyState } from '@/components/ui/empty-state';
import { gsap, ScrollTrigger, EASE, STAGGER_CARD } from '@/lib/gsap';
import type { PortfolioProject } from '@/lib/projects';

interface FeaturedProjectsClientProps {
  projects: PortfolioProject[];
}

export function FeaturedProjectsClient({ projects }: FeaturedProjectsClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Header children stagger up
      if (headerRef.current?.children) {
        gsap.from(Array.from(headerRef.current.children), {
          y: 28,
          duration: 0.7,
          ease: EASE,
          stagger: 0.1,
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            once: true,
          },
        });
      }

      // Cards stagger up on scroll
      if (gridRef.current?.children) {
        gsap.from(Array.from(gridRef.current.children), {
          y: 60,
          duration: 0.85,
          ease: EASE,
          stagger: STAGGER_CARD,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 82%',
            once: true,
          },
        });
      }

      // CTA lifts in last
      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          y: 20,
          duration: 0.6,
          ease: EASE,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 92%',
            once: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-24 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-12">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-3">
            Featured Work
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Featured Projects
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A selection of projects that showcase my skills and passion for building great software.
          </p>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={<Code2 className="h-12 w-12 text-primary" />}
            title="Featured projects coming soon"
            description="I'm working on some exciting projects to feature here. Check back soon to see what I've been building."
            actionText="Check back soon"
          />
        ) : (
          <>
            <div
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
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
            </div>

            <div ref={ctaRef} className="text-center">
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
