'use client';

import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { desktopApps } from './apps';

interface LauncherProps {
  open: boolean;
  onOpenApp: (id: string) => void;
  onExit: () => void;
}

export function Launcher({ open, onOpenApp, onExit }: LauncherProps) {
  return (
    <div
      aria-hidden={!open}
      className={cn(
        'absolute bottom-14 left-3 z-50 flex w-64 flex-col gap-0.5 rounded-2xl border border-border bg-card/95 p-2 shadow-card backdrop-blur-xl transition-all duration-150',
        open
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0'
      )}
    >
      <div className="px-2 pb-2 pt-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
        Applications
      </div>
      {desktopApps.map((app) => {
        const Icon = app.icon;
        return (
          <button
            key={app.id}
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={() => onOpenApp(app.id)}
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-foreground hover:bg-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md',
                app.tint === 'accent' ? 'bg-accent/15 text-accent' : 'bg-primary/15 text-primary'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            {app.title}
          </button>
        );
      })}
      <div className="my-1 h-px bg-border" />
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        onClick={onExit}
        className="flex items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/15">
          <LogOut className="h-3.5 w-3.5" />
        </span>
        Exit to site
      </button>
    </div>
  );
}
