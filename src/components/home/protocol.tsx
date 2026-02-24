'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, EASE } from '@/lib/gsap';
import { protocolSteps } from '@/components/data/sections';

export function Protocol() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Header fade-up
      gsap.from(headerRef.current, {
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: EASE,
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%', once: true },
      });

      const cards = Array.from(
        stackRef.current?.querySelectorAll('[data-protocol-card]') ?? []
      ) as HTMLElement[];

      // On desktop: pin the section and animate cards stacking in on scroll
      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px)', () => {
        // Set initial state — cards below visible area
        gsap.set(cards, { y: 60, opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stackRef.current,
            start: 'top 70%',
            end: `+=${cards.length * 180}`,
            scrub: 0.8,
          },
        });

        cards.forEach((card, i) => {
          tl.to(
            card,
            { y: 0, opacity: 1, duration: 0.5, ease: EASE },
            i * 0.3
          );
        });
      });

      // On mobile: simple stagger reveal
      mm.add('(max-width: 767px)', () => {
        gsap.from(cards, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: EASE,
          stagger: 0.15,
          scrollTrigger: {
            trigger: stackRef.current,
            start: 'top 85%',
            once: true,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-secondary/10"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-16">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-3">
            Protocol
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            How I Build
          </h2>
        </div>

        {/* Stacking cards */}
        <div
          ref={stackRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {protocolSteps.map((step) => (
            <div
              key={step.number}
              data-protocol-card
              className="bg-card border border-border/50 rounded-[2rem] p-8 shadow-soft hover:shadow-hover transition-all duration-300 group"
            >
              {/* Step number */}
              <p className="font-mono text-5xl font-bold text-muted-foreground/20 mb-6 group-hover:text-primary/20 transition-colors duration-300">
                {step.number}
              </p>

              {/* Title */}
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                {step.title}
              </h3>

              {/* Summary — shown always */}
              <p className="text-sm font-mono text-primary/70 mb-4">{step.summary}</p>

              {/* Detail — shown on hover */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
