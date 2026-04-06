'use client';

import { useState, useEffect } from 'react';
import { useEasterEggs } from '@/hooks/use-easter-eggs';
import { DevOverlay } from '@/components/ui/dev-overlay';
import { personalInfo } from '@/components/data/content';

export function EasterEggsInit() {
  const [devOverlayOpen, setDevOverlayOpen] = useState(false);

  // Initialize all global easter eggs
  useEasterEggs({ onDevOverlay: setDevOverlayOpen });

  // Console Art Easter Egg
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only log once
    if ((window as any).__easterEggLogged) return;
    (window as any).__easterEggLogged = true;

    console.log(
      '%cTN# %c— Hey, fellow dev! Built with Next.js 15, TypeScript + Tailwind. Want to work together? → %c%s',
      'color: #4F93FF; font-weight: bold; font-size: 16px; font-family: sans-serif;',
      'color: inherit; font-size: 14px; font-family: sans-serif;',
      'color: #3DB89F; font-size: 14px; font-weight: bold; font-family: sans-serif;',
      personalInfo.email
    );
  }, []);

  return (
    <DevOverlay
      open={devOverlayOpen}
      onOpenChange={setDevOverlayOpen}
    />
  );
}
