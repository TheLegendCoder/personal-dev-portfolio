'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, triggerCelebrationFrom } from "@/lib/utils";
import { gsap, ScrollTrigger, EASE } from "@/lib/gsap";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Blog", path: "/blog" },
  { name: "Tutorials", path: "/tutorials" },
];

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

  // Never render the public navbar inside the admin area
  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        ref={navRef}
        className={cn(
          "pointer-events-auto transition-all duration-500 ease-out rounded-full border",
          scrolled
            ? "bg-background/80 backdrop-blur-md border-border/50 shadow-lg py-2 px-6"
            : "bg-transparent border-transparent py-4 px-4"
        )}
      >
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link
            href="/"
            ref={logoRef}
            onClick={handleLogoClick}
            onDoubleClick={(e) => e.preventDefault()} // Help prevent text selection
            className="text-lg font-display font-semibold text-foreground hover:text-primary transition-colors select-none inline-block relative hover:ring-1 hover:ring-primary/30 rounded px-1 -ml-1"
          >
            TN<span ref={hashRef} className="text-primary">#</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.path}
                href={link.path}
                ref={(el) => { navLinkRefs.current[i] = el; }}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 inline-block",
                  pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-4 p-4 bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200",
                    pathname === link.path
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

