'use client';

import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import type { DesktopApp } from './apps';

interface TaskbarProps {
  openApp: DesktopApp | null;
  minimized: boolean;
  onAppClick: () => void;
  onExit: () => void;
}

export function Taskbar({ openApp, minimized, onAppClick, onExit }: TaskbarProps) {
  // Clock is client-only state to avoid an SSR/client hydration mismatch
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(format(new Date(), 'HH:mm'));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const OpenAppIcon = openApp?.icon;

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex h-12 items-center gap-2 border-t border-border bg-card/80 px-3 backdrop-blur-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={onExit}
        aria-label="Exit desktop mode"
        title="Exit desktop mode"
        className="gap-2 rounded-full font-display font-semibold"
      >
        <LogOut className="h-4 w-4" />
        TN<span className="text-primary -ml-2">#</span>
      </Button>

      {openApp && OpenAppIcon && (
        <button
          type="button"
          onClick={onAppClick}
          aria-label={
            minimized ? `Restore ${openApp.title}` : `Minimize ${openApp.title}`
          }
          className={cn(
            'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            minimized
              ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              : 'bg-primary/10 text-primary'
          )}
        >
          <OpenAppIcon className="h-4 w-4" />
          {openApp.title}
        </button>
      )}

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle source="taskbar" className="rounded-full" />
        <span className="min-w-[3ch] text-sm font-mono text-muted-foreground tabular-nums">
          {time ?? ''}
        </span>
      </div>
    </div>
  );
}
