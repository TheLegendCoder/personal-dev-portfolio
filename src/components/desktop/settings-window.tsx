'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme, type Theme } from '@/hooks/use-theme';
import { trackEvent } from '@/lib/posthog-events';
import { cn } from '@/lib/utils';

const appearanceOptions: {
  value: Theme;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright and clean',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow your OS preference',
    icon: Monitor,
  },
];

export function SettingsWindow() {
  const { theme, setTheme } = useTheme();

  const handleChange = (value: string) => {
    const next = value as Theme;
    setTheme(next);
    const resolved =
      next === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : next;
    trackEvent('theme_changed', { theme: next, resolved, source: 'settings' });
  };

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <h2 className="text-lg font-display font-semibold text-foreground">
        Appearance
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose how the site looks. The preference is shared with the regular
        layout and persists across visits.
      </p>

      <RadioGroup
        value={theme}
        onValueChange={handleChange}
        className="mt-6 grid gap-3 sm:grid-cols-3"
        aria-label="Theme"
      >
        {appearanceOptions.map((option) => {
          const Icon = option.icon;
          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition-colors',
                theme === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              )}
            >
              <div className="flex items-center justify-between">
                <Icon
                  className={cn(
                    'h-5 w-5',
                    theme === option.value
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                />
                <RadioGroupItem value={option.value} aria-label={option.label} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
