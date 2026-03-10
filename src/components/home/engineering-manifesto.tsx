'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, EASE, STAGGER_TEXT } from '@/lib/gsap';
import { manifestoText } from '@/components/data/sections';

export function EngineeringManifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const el = textRef.current;
    if (!el) return;

    // Split text into word spans for per-word reveal
    const words = manifestoText.split(' ');
    el.innerHTML = words
      .map((w) => `<span class="inline-block">${w}&nbsp;</span>`)
      .join('');

    const ctx = gsap.context(() => {
      // Label fade in
      gsap.from(labelRef.current, {
        y: 16,
        opacity: 0,
        duration: 0.6,
        ease: EASE,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });

      // Word-by-word reveal
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
      className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-foreground dark:bg-background border-y border-border/20"
    >
      <div className="max-w-4xl mx-auto">
        <p
          ref={labelRef}
          className="text-xs font-mono text-background/50 dark:text-foreground/50 tracking-widest uppercase mb-8"
        >
          Engineering Manifesto
        </p>
        <p
          ref={textRef}
          className="text-2xl sm:text-3xl md:text-4xl font-display font-bold leading-snug text-background dark:text-foreground"
        >
          {manifestoText}
        </p>
      </div>
    </section>
  );
}
