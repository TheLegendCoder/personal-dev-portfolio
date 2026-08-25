'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Monitor, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn, triggerCelebrationFrom } from "@/lib/utils";
import { gsap, ScrollTrigger, EASE, prefersReducedMotion } from "@/lib/gsap";
import { primaryNav, isNavItemActive } from "@/lib/nav";
import { trackNavigationClick } from "@/lib/posthog-events";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const navLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Logo Easter Egg
  const logoRef = useRef<HTMLAnchorElement>(null);
  const hashRef = useRef<HTMLSpanElement>(null);
  const clickCountRef = useRef(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // GSAP ScrollTrigger — drives the pill morph on scroll
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top -40px",
        onEnter: () => setScrolled(true),
        onLeaveBack: () => setScrolled(false),
      });
    });

    return () => ctx.revert();
  }, []);

  // Magnetic hover on desktop nav links
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;
    const cleanups: (() => void)[] = [];

    navLinkRefs.current.forEach((el) => {
      if (!el) return;
      function onMove(e: MouseEvent) {
        const rect = el!.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
        gsap.to(el, { x, y, duration: 0.35, ease: EASE });
      }
      function onLeave() {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: EASE });
      }
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Konami Hint Listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    function onKonamiStep() {
      if (hashRef.current) {
        gsap.to(hashRef.current, { color: '#fff', duration: 0.1, yoyo: true, repeat: 1 });
      }
    }

    window.addEventListener('konami-step', onKonamiStep as EventListener);
    return () => window.removeEventListener('konami-step', onKonamiStep as EventListener);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    clickCountRef.current += 1;

    // If they are fast-clicking to trigger the easter egg, stop navigation
    // On a single slow click, let it navigate normally
    if (clickCountRef.current > 1) {
      e.preventDefault();
    }

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);

    if (logoRef.current) {
      if (clickCountRef.current === 2) {
        gsap.to(logoRef.current, { x: 3, duration: 0.05, yoyo: true, repeat: 5 });
      } else if (clickCountRef.current === 4) {
        gsap.to(logoRef.current, { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1 });
      } else if (clickCountRef.current === 5) {
        gsap.to(logoRef.current, { rotation: 360, duration: 0.7, ease: 'back.out(1.7)' });
        triggerCelebrationFrom(logoRef.current, { intensity: 'low' });
        clickCountRef.current = 0;
      }
    }
  };

  // Never render the public navbar inside the admin area or the desktop shell
  if (pathname.startsWith('/admin') || pathname.startsWith('/desktop')) return null;

  return (
    <header
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ease-out",
        scrolled
          ? "bg-background border-border"
          : "bg-transparent border-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-16">
        {/* Logo */}
        <Link
          href="/"
          ref={logoRef}
          onClick={handleLogoClick}
          onDoubleClick={(e) => e.preventDefault()} // Help prevent text selection
          className="inline-block select-none font-mono text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          TN<span ref={hashRef} className="text-primary">#</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {primaryNav.map((item, i) => {
            const active = isNavItemActive(pathname, item);

            const trigger = (
              <Link
                href={item.path}
                ref={(el) => { navLinkRefs.current[i] = el; }}
                onClick={() => trackNavigationClick(item.name, item.path, 'navbar')}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  "mono-label border-b-2 py-1 transition-colors duration-200 inline-block",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {item.name}
              </Link>
            );

            if (!item.children) {
              return <div key={item.path}>{trigger}</div>;
            }

            // The sub-menu opens on hover and on keyboard focus (focus-within),
            // so it carries no open/close state that could desync from the GSAP
            // magnetic-hover handlers bound to the trigger link above.
            return (
              <div key={item.path} className="group relative">
                {trigger}
                <div
                  className={cn(
                    "invisible absolute left-1/2 top-full z-50 min-w-[11rem] -translate-x-1/2 pt-4 opacity-0 transition-opacity duration-200",
                    "group-hover:visible group-hover:opacity-100",
                    "group-focus-within:visible group-focus-within:opacity-100"
                  )}
                >
                  <ul className="flex flex-col border border-border bg-background py-1 shadow-lg">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <Link
                          href={child.path}
                          onClick={() =>
                            trackNavigationClick(child.name, child.path, 'navbar-dropdown')
                          }
                          className="mono-label block whitespace-nowrap px-4 py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
          <ThemeToggle source="navbar" />
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            asChild
          >
            <Link
              href="/desktop"
              aria-label="Switch to desktop view"
              title="Desktop view"
            >
              <Monitor className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="flex flex-col gap-1 px-4 py-4">
            {primaryNav.map((item) => {
              const active = isNavItemActive(pathname, item);
              return (
                <div key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => {
                      trackNavigationClick(item.name, item.path, 'mobile');
                      setIsOpen(false);
                    }}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      "mono-label block border-l-2 px-4 py-3 transition-colors duration-200",
                      active
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {item.name}
                  </Link>
                  {item.children && (
                    <ul className="flex flex-col">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <Link
                            href={child.path}
                            onClick={() => {
                              trackNavigationClick(child.name, child.path, 'mobile');
                              setIsOpen(false);
                            }}
                            className="mono-label block border-l-2 border-transparent py-2 pl-10 pr-4 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="mono-label">Theme</span>
              <ThemeToggle source="navbar" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
