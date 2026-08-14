'use client';

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { personalInfo } from "@/components/data/content";
import { gsap, ScrollTrigger, EASE, EASE_SNAPPY, STAGGER_TEXT, wordReveal, prefersReducedMotion } from "@/lib/gsap";

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const monogramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set([taglineRef.current, ctaRef.current, monogramRef.current], { opacity: 1, y: 0, x: 0 });
        if (headlineRef.current) headlineRef.current.style.opacity = "1";
        return;
      }

      // Kinetic word-by-word reveal for the headline
      if (headlineRef.current) wordReveal(headlineRef.current);

      const tl = gsap.timeline({ defaults: { ease: EASE }, delay: 0.5 });

      tl.from(taglineRef.current, { y: 24, opacity: 0, duration: 0.7 })
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(
          monogramRef.current,
          { opacity: 0, x: 40, scale: 0.92, duration: 1, ease: EASE_SNAPPY },
          "-=0.9"
        );

      // Subtle scroll-linked drift on the monogram device
      gsap.to(monogramRef.current, {
        y: -40,
        rotation: 4,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const firstName = personalInfo.name.split(" ")[0];

  return (
    <section
      ref={sectionRef}
      className="telemetry-grid-bg w-full min-h-[100dvh] flex items-center px-4 sm:px-6 lg:px-8 py-24 lg:py-0 relative overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-8 items-center">
        {/* Left: headline / subtext / CTAs */}
        <div className="text-left">
          <h1
            ref={headlineRef}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-[-0.04em] text-foreground leading-[0.95] mb-6"
          >
            {personalInfo.name}
            <span className="text-primary">.</span>{" "}
            <span className="text-muted-foreground">{personalInfo.title}.</span>
          </h1>

          <p
            ref={taglineRef}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-10"
          >
            {personalInfo.bio}
          </p>

          <div ref={ctaRef} className="flex flex-col sm:flex-row items-start gap-4">
            <MagneticButton>
              <Button asChild size="lg" className="group">
                <Link href="/projects">
                  View My Work
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document.querySelector("footer")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Contact Me
              </Button>
            </MagneticButton>
          </div>
        </div>

        {/* Right: oversized kinetic monogram — the graphic anchor in place of a photo */}
        <div className="hidden lg:flex items-center justify-center">
          <div
            ref={monogramRef}
            className="font-display font-bold text-[16rem] leading-none text-primary/10 select-none"
            aria-hidden="true"
          >
            {firstName[0]}
            <span className="text-foreground/[0.06]">#</span>
          </div>
        </div>
      </div>
    </section>
  );
}
