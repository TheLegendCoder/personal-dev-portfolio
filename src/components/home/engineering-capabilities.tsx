'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, EASE, STAGGER_CARD } from '@/lib/gsap';
import {
  architecturePrinciples,
  telemetryLogLines,
  releaseSchedule,
} from '@/components/data/sections';

// ─── Architecture Shuffler ────────────────────────────────────────────────────

function ArchitectureShuffler() {
  const [index, setIndex] = useState(0);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const el = textRef.current;
      if (!el) return;

      gsap.to(el, {
        opacity: 0,
        y: -12,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          setIndex((prev) => (prev + 1) % architecturePrinciples.length);
          gsap.fromTo(
            el,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.3, ease: EASE }
          );
        },
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full justify-between">
      <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">
        Architecture Principle
      </p>
      <div className="flex-1 flex items-center justify-center">
        <span
          ref={textRef}
          className="text-2xl font-display font-bold text-foreground text-center leading-tight"
        >
          {architecturePrinciples[index]}
        </span>
      </div>
      <div className="flex gap-1 justify-center">
        {architecturePrinciples.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index ? 'w-4 bg-primary' : 'w-1 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Production Telemetry Feed ────────────────────────────────────────────────

function TelemetryFeed() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: listRef.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        inViewRef.current = true;
        let i = 0;
        intervalRef.current = setInterval(() => {
          if (i >= telemetryLogLines.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Restart after pause
            setTimeout(() => {
              setVisibleLines([]);
              i = 0;
              intervalRef.current = setInterval(() => {
                setVisibleLines((prev) => [...prev, telemetryLogLines[i++]]);
                if (i >= telemetryLogLines.length && intervalRef.current) {
                  clearInterval(intervalRef.current);
                }
              }, 320);
            }, 3000);
            return;
          }
          setVisibleLines((prev) => [...prev, telemetryLogLines[i++]]);
        }, 320);
      },
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">
        Production Telemetry
      </p>
      <div
        ref={listRef}
        className="flex-1 font-mono text-xs leading-relaxed overflow-hidden space-y-0.5"
      >
        {visibleLines.map((line, i) => {
          if (!line) return null;
          return (
            <div
              key={i}
              className={`${
                line.startsWith('\u2713')
                  ? 'text-green-500'
                  : line.startsWith('\u25b6')
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {line}
            </div>
          );
        })}
        <span className="inline-block w-1.5 h-3 bg-primary animate-pulse" />
      </div>
    </div>
  );
}

// ─── Release Scheduler ────────────────────────────────────────────────────────

function ReleaseScheduler() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cells = Array.from(
        gridRef.current?.querySelectorAll('[data-cell]') ?? []
      );

      gsap.from(cells, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'back.out(1.7)',
        stagger: {
          amount: 0.8,
          from: 'random',
        },
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
          once: true,
        },
      });
    }, gridRef);

    return () => ctx.revert();
  }, []);

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">
        Release Scheduler
      </p>

      {/* Column headers */}
      <div className="grid grid-cols-4 gap-1 mb-1 pl-8">
        {['W1', 'W2', 'W3', 'W4'].map((w) => (
          <span key={w} className="text-[10px] font-mono text-muted-foreground/50 text-center">
            {w}
          </span>
        ))}
      </div>

      <div ref={gridRef} className="flex flex-col gap-1">
        {DAYS.map((day, di) => (
          <div key={day} className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-muted-foreground/50 w-7 shrink-0">
              {day}
            </span>
            <div className="grid grid-cols-4 gap-1 flex-1">
              {releaseSchedule
                .filter((c) => c.day === day)
                .map((cell, wi) => (
                  <div
                    key={`${di}-${wi}`}
                    data-cell
                    className={`h-5 rounded-sm transition-colors ${
                      cell.status === 'shipped'
                        ? 'bg-green-500/80'
                        : cell.status === 'planned'
                        ? 'bg-primary/40 border border-primary/60'
                        : 'bg-muted/40'
                    }`}
                    title={`${day} W${cell.week}: ${cell.status}`}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3">
        {[
          { color: 'bg-green-500/80', label: 'Shipped' },
          { color: 'bg-primary/40 border border-primary/60', label: 'Planned' },
          { color: 'bg-muted/40', label: 'Idle' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
            <span className="text-[10px] font-mono text-muted-foreground/60">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function EngineeringCapabilities() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: EASE,
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%', once: true },
      });

      const cards = Array.from(cardsRef.current?.children ?? []);
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: EASE,
        stagger: STAGGER_CARD,
        scrollTrigger: { trigger: cardsRef.current, start: 'top 82%', once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-12">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-3">
            Engineering Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            How I think about systems
          </h2>
        </div>

        {/* Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { key: 'arch', node: <ArchitectureShuffler /> },
            { key: 'feed', node: <TelemetryFeed /> },
            { key: 'sched', node: <ReleaseScheduler /> },
          ].map(({ key, node }) => (
            <div
              key={key}
              className="bg-card border border-border/50 rounded-[1.5rem] p-6 min-h-[220px] shadow-soft hover:shadow-hover transition-shadow duration-300"
            >
              {node}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
