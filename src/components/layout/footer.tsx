'use client';

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { personalInfo } from "@/components/data/content";
import { useToast } from "@/hooks/use-toast";
import { triggerCelebrationFrom } from "@/lib/utils";

const socialLinks = [
  { name: "GitHub", icon: Github, url: personalInfo.socialLinks.github },
  { name: "LinkedIn", icon: Linkedin, url: personalInfo.socialLinks.linkedin },
  { name: "Twitter", icon: Twitter, url: personalInfo.socialLinks.twitter },
  { name: "Email", icon: Mail, url: `mailto:${personalInfo.email}`, email: true },
];

const footerLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Blog", path: "/blog" },
  { name: "Tutorials", path: "/tutorials" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { toast } = useToast();
  const pathname = usePathname();

  // Footer Easter Egg
  const copyrightRef = useRef<HTMLSpanElement>(null);
  const clickCountRef = useRef(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [copyrightSymbol, setCopyrightSymbol] = useState("©");

  // Never render the public footer inside the admin area
  if (pathname.startsWith('/admin')) return null;

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

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>, email: string) => {
    e.preventDefault();
    
    // Copy email to clipboard
    navigator.clipboard.writeText(email).then(() => {
      const target = e.currentTarget;
      
      // Trigger celebration
      triggerCelebrationFrom(target, { intensity: 'low' });
      
      // Show success toast
      toast({
        variant: "success",
        title: "Email copied! ✨",
        description: `${email} is ready to paste`,
        duration: 3000,
      });
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Couldn't copy email",
        description: "Please try again",
        duration: 3000,
      });
    });
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">System Operational</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
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
                onClick={social.email ? (e) => handleEmailClick(e, personalInfo.email) : undefined}
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
          <p className="text-xs text-muted-foreground font-mono">
            {personalInfo.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
