'use client';

import type { DesktopApp } from './apps';

interface DesktopIconProps {
  app: DesktopApp;
  isOpen: boolean;
  onOpen: (id: string, opener: HTMLElement) => void;
}

export function DesktopIcon({ app, isOpen, onOpen }: DesktopIconProps) {
  const Icon = app.icon;

  return (
    <button
      type="button"
      onClick={(event) => onOpen(app.id, event.currentTarget)}
      onDoubleClick={(event) => event.preventDefault()}
      aria-label={`Open ${app.title}`}
      className="group flex w-20 flex-col items-center gap-1.5 rounded-lg p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 gradient-card shadow-soft transition-transform duration-200 group-hover:scale-105">
        <Icon className="h-6 w-6 text-primary" />
        {isOpen && (
          <span
            className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="select-none text-xs text-foreground/80 [text-shadow:0_1px_2px_hsl(var(--background))]">
        {app.title}
      </span>
    </button>
  );
}
