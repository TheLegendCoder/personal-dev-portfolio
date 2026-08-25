'use client';

import { Github, Linkedin, Mail, Twitter, Copy } from 'lucide-react';
import { personalInfo } from '@/components/data/content';
import { useCopyEmail } from '@/hooks/use-copy-email';
import { trackContactConversion } from '@/lib/posthog-events';

/**
 * The contact channels list.
 *
 * Deliberately not a form: there is no backend to receive one, and a form that
 * silently drops messages is worse than an honest mailto. The email row copies
 * to the clipboard using the same interaction as the footer icon.
 */
export function ContactChannels() {
  const handleEmailClick = useCopyEmail();

  const channels = [
    ...(personalInfo.email
      ? [
          {
            name: 'Email',
            icon: Mail,
            value: personalInfo.email,
            detail: 'Best for anything substantial. Click to copy.',
            href: `mailto:${personalInfo.email}`,
            onClick: (e: React.MouseEvent<HTMLAnchorElement>) =>
              handleEmailClick(e, personalInfo.email),
            external: false,
          },
        ]
      : []),
    {
      name: 'LinkedIn',
      icon: Linkedin,
      value: 'ndawonde',
      detail: 'Best for professional enquiries and roles.',
      href: personalInfo.socialLinks.linkedin,
      onClick: () => trackContactConversion('linkedin'),
      external: true,
    },
    {
      name: 'GitHub',
      icon: Github,
      value: 'tsholofelondawonde',
      detail: 'Best for code, issues, and pull requests.',
      href: personalInfo.socialLinks.github,
      onClick: () => trackContactConversion('github'),
      external: true,
    },
    {
      name: 'X',
      icon: Twitter,
      value: 'tsholo_dev',
      detail: 'Best for short questions and everything in passing.',
      href: personalInfo.socialLinks.twitter,
      onClick: () => trackContactConversion('twitter'),
      external: true,
    },
  ];

  return (
    <ul className="flex flex-col">
      {channels.map((channel) => (
        <li key={channel.name}>
          <a
            href={channel.href}
            onClick={channel.onClick}
            target={channel.external ? '_blank' : undefined}
            rel={channel.external ? 'noopener noreferrer' : undefined}
            className="group flex items-start gap-5 border-t border-border py-6 transition-colors last:border-b hover:bg-muted/30"
          >
            <channel.icon
              aria-hidden="true"
              className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            />
            <span className="flex flex-1 flex-col gap-1">
              <span className="mono-label text-muted-foreground">
                {channel.name}
              </span>
              <span className="flex items-center gap-2 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                {channel.value}
                {!channel.external && (
                  <Copy aria-hidden="true" className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </span>
              <span className="text-sm text-muted-foreground">
                {channel.detail}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
