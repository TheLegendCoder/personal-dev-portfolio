'use client';

import { Github, Linkedin, Twitter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { personalInfo } from '@/components/data/content';

interface ContactPanelProps {
  open: boolean;
  onClose: () => void;
}

const SOCIALS = [
  { key: 'github', label: 'View GitHub', icon: Github, href: personalInfo.socialLinks.github },
  { key: 'linkedin', label: 'Connect on LinkedIn', icon: Linkedin, href: personalInfo.socialLinks.linkedin },
  { key: 'twitter', label: 'Follow on X', icon: Twitter, href: personalInfo.socialLinks.twitter },
].filter((s) => !!s.href);

export function ContactPanel({ open, onClose }: ContactPanelProps) {
  return (
    <div
      aria-hidden={!open}
      className={cn(
        'absolute bottom-14 right-3 z-50 w-72 rounded-2xl border border-border bg-card/95 p-4 shadow-card backdrop-blur-xl transition-all duration-150',
        open
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-sm font-semibold text-foreground">
            {personalInfo.availability}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
        Based in {personalInfo.location}. {personalInfo.tagline}.
      </p>
      <div className="flex flex-col gap-2">
        {SOCIALS.map((s) => (
          <a
            key={s.key}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
