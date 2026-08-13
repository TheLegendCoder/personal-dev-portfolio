'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, EASE, STAGGER_TEXT, prefersReducedMotion } from '@/lib/gsap';
import { manifestoText } from '@/components/data/sections';

export function EngineeringManifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const el = textRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = manifestoText;
      gsap.set(el, { opacity: 1 });
      return;
    }

    // Split text into word spans for per-word reveal
    const words = manifestoText.split(' ');
    el.innerHTML = words
      .map((w) => `<span class="inline-block">${w}&nbsp;</span>`)
      .join('');

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('span'), {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: EASE,
        stagger: STAGGER_TEXT,
        scrollTrigger: {
          trigger: el,
          start: 'top 78%',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-28 lg:py-36 px-4 sm:px-6 lg:px-8 bg-foreground dark:bg-background dark:border-y dark:border-border/20"
    >
      <div className="max-w-5xl mx-auto">
        <p
          ref={textRef}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-snug tracking-tight text-background dark:text-foreground"
        >
          {manifestoText}
        </p>
      </div>
    </section>
  );
}
