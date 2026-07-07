'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { trackEvent } from '@/lib/posthog-events';

interface ThemeToggleProps {
  className?: string;
  source: 'navbar' | 'taskbar';
}

export function ThemeToggle({ className, source }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  // The server doesn't know the stored theme, so gate the icon until mounted
  // to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  const handleToggle = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    trackEvent('theme_changed', { theme: next, resolved: next, source });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )
      ) : (
        <span className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}
