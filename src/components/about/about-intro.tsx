'use client';

import { useEffect, useRef } from 'react';
import { wordReveal, prefersReducedMotion } from '@/lib/gsap';

export function AboutIntro({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReducedMotion()) return;
    wordReveal(ref.current);
  }, []);

  return (
    <h1
      ref={ref}
      className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-12"
    >
      {text}
    </h1>
  );
}
