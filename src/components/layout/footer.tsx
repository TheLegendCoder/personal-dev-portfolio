'use client';

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { personalInfo } from "@/components/data/content";
import { useCopyEmail } from "@/hooks/use-copy-email";
import { triggerCelebrationFrom } from "@/lib/utils";
import { clearConsent } from "@/lib/consent";
import { footerNav } from "@/lib/nav";
import { trackContactConversion, trackNavigationClick } from "@/lib/posthog-events";

const socialLinks = [
  { name: "GitHub", icon: Github, url: personalInfo.socialLinks.github, method: "github" as const },
  { name: "LinkedIn", icon: Linkedin, url: personalInfo.socialLinks.linkedin, method: "linkedin" as const },
  { name: "Twitter", icon: Twitter, url: personalInfo.socialLinks.twitter, method: "twitter" as const },
  // Email link only appears once personalInfo.email is populated — an empty
  // address would otherwise render a dead mailto: link.
  ...(personalInfo.email
    ? [{ name: "Email", icon: Mail, url: `mailto:${personalInfo.email}`, method: "email" as const, email: true }]
    : []),
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const handleEmailClick = useCopyEmail();

  // Footer Easter Egg
  const copyrightRef = useRef<HTMLSpanElement>(null);
  const clickCountRef = useRef(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [copyrightSymbol, setCopyrightSymbol] = useState("©");

  // Never render the public footer inside the admin area or the desktop shell
  if (pathname.startsWith('/admin') || pathname.startsWith('/desktop')) return null;

  const handleCopyrightClick = () => {
    clickCountRef.current += 1;

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);

    if (clickCountRef.current === 2) {
      setCopyrightSymbol("🎉");
      setTimeout(() => setCopyrightSymbol("©"), 300);
    } else if (clickCountRef.current === 3) {
      if (copyrightRef.current) {
        triggerCelebrationFrom(copyrightRef.current, { intensity: 'low' });
      }
      clickCountRef.current = 0;
    }
  };

  return (
    <footer className="bg-background border-t border-border/50 py-12 mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Brand & Status */}
          <div className="space-y-4">
            <Link 
              href="/" 
              className="text-xl font-display font-semibold text-foreground"
            >
              {personalInfo.name}<span className="text-primary">.</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {personalInfo.title}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="mono-label">{personalInfo.availability}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 md:max-w-md">
            {footerNav.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => trackNavigationClick(link.name, link.path, 'footer')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target={social.email ? undefined : "_blank"}
                rel={social.email ? undefined : "noopener noreferrer"}
                onClick={
                  social.email
                    ? (e) => handleEmailClick(e, personalInfo.email)
                    : () => trackContactConversion(social.method)
                }
                className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            <span
              ref={copyrightRef}
              onClick={handleCopyrightClick}
              className="cursor-pointer inline-block select-none"
              title="Try clicking me..."
            >
              {copyrightSymbol}
            </span> {currentYear} {personalInfo.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={clearConsent}
              className="text-xs text-muted-foreground font-mono underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Cookie preferences
            </button>
            <p className="text-xs text-muted-foreground font-mono">
              {personalInfo.location}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
