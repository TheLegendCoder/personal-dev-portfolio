'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gsap, ScrollTrigger, EASE, STAGGER_CARD, prefersReducedMotion } from '@/lib/gsap';

interface Post {
  slug: string;
  title: string;
  description: string;
  image?: string;
  date: string;
  readTime?: string;
  tags: string[];
  content?: string;
}

interface LatestPostsGridProps {
  posts: Post[];
}

export function LatestPostsGrid({ posts }: LatestPostsGridProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
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
          y: 32,
          opacity: 0,
          duration: 0.7,
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

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div ref={sectionRef}>
      <h2
        ref={headerRef}
        className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-foreground mb-12 lg:mb-16 max-w-2xl"
      >
        Latest Writing
      </h2>

      {/* Stacked editorial list — deliberately no thumbnails or grid, distinct
          from the image-forward Projects section above it. */}
      <div ref={listRef} className="flex flex-col divide-y divide-border">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 py-6"
          >
            <span className="font-mono text-sm text-muted-foreground shrink-0 sm:w-32">
              {formatDate(post.date)}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
                {post.description}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 hidden sm:block" />
          </Link>
        ))}
      </div>

      <div ref={ctaRef} className="mt-12">
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
