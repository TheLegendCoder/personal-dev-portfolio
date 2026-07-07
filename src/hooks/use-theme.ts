'use client';

/**
 * Theme store — module-level state + useSyncExternalStore, no provider needed.
 * The inline <head> script in src/app/layout.tsx applies the initial class
 * pre-paint; this hook takes over for runtime changes.
 */
import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';
const isBrowser = typeof window !== 'undefined';

const listeners = new Set<() => void>();

function readStoredTheme(): Theme {
  if (!isBrowser) return 'system';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage unavailable (private mode / blocked) — fall back to system
  }
  return 'system';
}

let currentTheme: Theme = readStoredTheme();

function systemPrefersDark(): boolean {
  return isBrowser && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme;
}

function applyTheme() {
  if (!isBrowser) return;
  const isDark = resolveTheme(currentTheme) === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  // Desktop-mode windows host same-origin iframes that share the preference.
  document.querySelectorAll('iframe').forEach((frame) => {
    try {
      frame.contentDocument?.documentElement.classList.toggle('dark', isDark);
    } catch {
      // cross-origin iframe — ignore
    }
  });
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function setTheme(theme: Theme) {
  currentTheme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // persistence unavailable — theme still applies for this page
  }
  applyTheme();
  notify();
}

if (isBrowser) {
  // Follow OS preference while set to 'system'
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (currentTheme === 'system') {
        applyTheme();
        notify();
      }
    });

  // Cross-tab sync
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      currentTheme = readStoredTheme();
      applyTheme();
      notify();
    }
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme(): {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
} {
  const theme = useSyncExternalStore(
    subscribe,
    () => currentTheme,
    () => 'system' as Theme
  );
  const resolvedTheme = useSyncExternalStore(
    subscribe,
    () => resolveTheme(currentTheme),
    () => 'light' as const
  );

  return { theme, resolvedTheme, setTheme };
}
