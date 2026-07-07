'use client';

import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { personalInfo } from '@/components/data/content';
import { getApp } from './apps';

interface WindowEntry {
  appId: string;
  z: number;
  minimized: boolean;
}

interface TaskbarProps {
  windows: WindowEntry[];
  focusedAppId: string | null;
  onAppClick: (id: string) => void;
  onExit: () => void;
  launcherOpen: boolean;
  onToggleLauncher: () => void;
  onToggleContact: () => void;
}

export function Taskbar({
  windows,
  focusedAppId,
  onAppClick,
  onExit,
  launcherOpen,
  onToggleLauncher,
  onToggleContact,
}: TaskbarProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(format(new Date(), 'HH:mm'));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      data-testid="desktop-taskbar"
      className="absolute inset-x-0 bottom-0 z-50 flex h-12 items-center gap-2 border-t border-border bg-card/80 px-3 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={onToggleLauncher}
        aria-label="Toggle app launcher"
        aria-pressed={launcherOpen ? 'true' : 'false'}
        title="Applications"
        className={cn(
          'flex items-center rounded-full border px-3.5 py-1.5 font-display text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          launcherOpen
            ? 'border-primary/50 bg-primary/15 text-foreground'
            : 'border-border bg-secondary/60 text-foreground hover:bg-secondary'
        )}
      >
        TN<span className="text-primary">#</span>
      </button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onExit}
        aria-label="Exit desktop mode"
        title="Exit desktop mode"
        className="rounded-full"
      >
        <LogOut className="h-4 w-4" />
      </Button>

      <div className="flex flex-1 items-center gap-2 overflow-x-auto">
        {windows.map((entry) => {
          const app = getApp(entry.appId);
          if (!app) return null;
          const Icon = app.icon;
          const active = focusedAppId === entry.appId && !entry.minimized;
          return (
            <button
              key={entry.appId}
              type="button"
              onClick={() => onAppClick(entry.appId)}
              aria-label={
                entry.minimized ? `Restore ${app.title}` : `Minimize ${app.title}`
              }
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  entry.minimized
                    ? 'bg-muted-foreground'
                    : app.tint === 'accent'
                      ? 'bg-accent'
                      : 'bg-primary'
                )}
              />
              <Icon className="h-4 w-4" />
              {app.title}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleContact}
          className="hidden items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 font-mono text-[11px] font-medium text-green-600 dark:text-green-400 hover:bg-green-500/15 sm:flex"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
          {personalInfo.availability}
        </button>
        <ThemeToggle source="taskbar" className="rounded-full" />
        <span className="min-w-[3ch] text-sm font-mono text-muted-foreground tabular-nums">
          {time ?? ''}
        </span>
      </div>
    </div>
  );
}
