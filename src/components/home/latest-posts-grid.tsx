'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogCard } from '@/components/blog/blogcard';
import { gsap, ScrollTrigger, EASE, STAGGER_CARD } from '@/lib/gsap';

interface Post {
  slug: string;
  title: string;
  description: string;
  image?: string;
  date: string;
  readTime?: string;
  tags: string[];
}

interface LatestPostsGridProps {
  posts: Post[];
}

export function LatestPostsGrid({ posts }: LatestPostsGridProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Header stagger
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

      // Cards stagger up
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

      // CTA fade in
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
    <div ref={sectionRef}>
      {/* Section Header */}
      <div ref={headerRef} className="text-center mb-12">
        <p className="text-xs font-mono text-primary tracking-widest uppercase mb-3">
          Blog
        </p>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
          Latest from the Blog
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Thoughts, tutorials, and insights about software development and technology.
        </p>
      </div>

      {/* Posts Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
      >
        {posts.map((post) => (
          <BlogCard
            key={post.slug}
            id={post.slug}
            title={post.title}
            excerpt={post.description}
            image={post.image ?? ''}
            date={post.date}
            readTime={post.readTime ?? '5 min read'}
            category={post.tags[0] || 'Article'}
          />
        ))}
      </div>

      {/* CTA */}
      <div ref={ctaRef} className="text-center">
        <Button asChild variant="outline" size="lg" className="group">
          <Link href="/blog">
            View All Posts
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
