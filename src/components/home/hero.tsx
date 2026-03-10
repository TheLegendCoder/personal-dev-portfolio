'use client';

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { personalInfo } from "@/components/data/content";
import { gsap, ScrollTrigger, EASE, STAGGER_TEXT } from "@/lib/gsap";

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Entrance timeline — staggered fade-up per spec (stagger: 0.08)
      const tl = gsap.timeline({ defaults: { ease: EASE } });

      tl.from(badgeRef.current, { y: 24, opacity: 0, duration: 0.7 })
        .from(
          headlineRef.current,
          { y: 40, opacity: 0, duration: 0.9 },
          `-=${STAGGER_TEXT * 2}`
        )
        .from(
          taglineRef.current,
          { y: 32, opacity: 0, duration: 0.8 },
          `-=${STAGGER_TEXT * 4}`
        )
        .from(
          ctaRef.current,
          { y: 24, opacity: 0, duration: 0.7 },
          `-=${STAGGER_TEXT * 4}`
        )
        .from(
          socialsRef.current,
          { y: 20, opacity: 0, duration: 0.6 },
          `-=${STAGGER_TEXT * 4}`
        )
        .from(
          scrollCueRef.current,
          { opacity: 0, duration: 0.5 },
          "-=0.2"
        );

      // Looping bounce on scroll-cue chevron
      gsap.to(scrollCueRef.current?.querySelector("svg") ?? [], {
        y: 8,
        duration: 0.9,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="gradient-hero w-full min-h-screen flex flex-col items-center justify-center py-24 px-0 relative"
    >
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl text-center px-4 sm:px-6 lg:px-8 mx-auto">

          {/* Availability badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            {personalInfo.availability}
          </div>

          {/* Main heading */}
          <h1
            ref={headlineRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6"
          >
            Hi, I&apos;m{" "}
            <span className="text-gradient">
              {personalInfo.name.split(" ")[0]}
            </span>
            <br />
            <span className="text-muted-foreground">{personalInfo.title}</span>
          </h1>

          {/* Tagline */}
          <p
            ref={taglineRef}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            {personalInfo.bio}
          </p>

          {/* CTA Buttons */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
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

          {/* Social Links */}
          <div
            ref={socialsRef}
            className="flex items-center justify-center gap-4"
          >
            {[
              { href: personalInfo.socialLinks.github, Icon: Github, label: "GitHub" },
              { href: personalInfo.socialLinks.linkedin, Icon: Linkedin, label: "LinkedIn" },
              { href: personalInfo.socialLinks.twitter, Icon: Twitter, label: "Twitter" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-card shadow-soft hover:shadow-hover hover:-translate-y-1 transition-all duration-300"
                aria-label={label}
              >
                <Icon className="h-5 w-5 text-foreground" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        ref={scrollCueRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/60 text-xs tracking-widest uppercase"
      >
        <span>Scroll</span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </section>
  );
}

