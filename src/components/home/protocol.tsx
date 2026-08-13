'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, EASE, STICKY_STACK_SCRUB, prefersReducedMotion } from '@/lib/gsap';
import { protocolSteps } from '@/components/data/sections';

export function Protocol() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion()) {
      if (headerRef.current) gsap.set(headerRef.current, { opacity: 1, y: 0 });
      const cards = stackRef.current?.querySelectorAll('[data-protocol-card]');
      if (cards) gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
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

      const mm = gsap.matchMedia();

      // Desktop: a real pinned sticky-stack, per taste-skill's canonical
      // skeleton — each card but the last pins at the viewport top; the
      // shrink/fade on a card is driven by the NEXT card's own ScrollTrigger.
      mm.add('(min-width: 768px)', () => {
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            endTrigger: cards[cards.length - 1],
            end: 'top top',
            pin: true,
            pinSpacing: false,
          });

          gsap.to(card, {
            scale: 0.92,
            opacity: 0.55,
            ease: 'none',
            scrollTrigger: {
              trigger: cards[i + 1],
              start: 'top bottom',
              end: 'top top',
              scrub: STICKY_STACK_SCRUB,
            },
          });
        });
      });

      // Mobile: simple stagger reveal, no pinning
      mm.add('(max-width: 767px)', () => {
        gsap.set(cards, { y: 40, opacity: 0 });
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
      className="w-full py-28 lg:py-36 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <h2
          ref={headerRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-foreground mb-16 lg:mb-24 max-w-2xl"
        >
          How I Build
        </h2>

        <div ref={stackRef} className="relative">
          {protocolSteps.map((step) => (
            <div
              key={step.number}
              data-protocol-card
              className="bg-card border border-border mb-8 md:mb-0 p-8 sm:p-12 shadow-soft"
            >
              <p className="font-mono text-6xl sm:text-7xl font-bold text-muted-foreground/20 mb-6">
                {step.number}
              </p>

              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                {step.title}
              </h3>

              <p className="text-sm font-mono text-primary/70 mb-4">{step.summary}</p>

              <p className="text-muted-foreground leading-relaxed max-w-xl">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
