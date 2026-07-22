'use client';

import { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/gsap';

interface BootScreenProps {
  onDone: () => void;
}

export function BootScreen({ onDone }: BootScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      onDone();
      return;
    }
    const id = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 7 + Math.random() * 9;
        if (next >= 100) {
          clearInterval(id);
          setTimeout(onDone, 260);
          return 100;
        }
        return next;
      });
    }, 90);
    return () => clearInterval(id);
    // onDone is stable enough in practice (desktop-shell passes a useCallback-free
    // inline setter); re-running this interval on every render would restart the boot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-background">
      <div className="flex h-[74px] w-[74px] animate-[float_2.6s_ease-in-out_infinite] items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_46px_-6px_hsl(var(--primary)/0.8)]">
        <Monitor className="h-8 w-8" />
      </div>
      <div className="text-center">
        <div className="font-display text-xl font-semibold text-foreground">
          TN<span className="text-primary">#</span> Desktop
        </div>
        <div className="mt-1.5 font-mono text-xs text-muted-foreground">
          initializing environment…
        </div>
      </div>
      <div className="h-[3px] w-60 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))] transition-[width] duration-100 ease-linear"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <button
        type="button"
        onClick={onDone}
        className="rounded-lg border border-border px-3.5 py-1.5 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary"
      >
        skip →
      </button>
    </div>
  );
}
