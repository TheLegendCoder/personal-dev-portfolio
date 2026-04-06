'use client';

import { useEffect, useRef, useState } from 'react';
import { triggerMilestoneCelebration, triggerCelebrationAt } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

interface UseEasterEggsProps {
  onDevOverlay: (open: boolean) => void;
}

export function useEasterEggs({ onDevOverlay }: UseEasterEggsProps) {
  const { toast } = useToast();

  // Konami Code State
  const konamiIndexRef = useRef(0);
  const konamiLastFiredRef = useRef(0);

  // Rage Click State
  const clicksRef = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleKeyDown(e: KeyboardEvent) {
      // 1. Dev Overlay (Shift + ?)
      if (e.key === '?' && e.shiftKey) {
        // Only trigger if not typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          onDevOverlay(true);
        }
      }

      // 2. Konami Code
      const currentKey = e.key;
      // Allow lowercase b/a even if caps lock is on, but match exact arrows
      const expectedKey = KONAMI_CODE[konamiIndexRef.current];

      if (currentKey.toLowerCase() === expectedKey.toLowerCase() || currentKey === expectedKey) {
        konamiIndexRef.current++;

        // Dispatch custom event for visual hints (e.g., logo flashing)
        window.dispatchEvent(new CustomEvent('konami-step', {
          detail: { step: konamiIndexRef.current }
        }));

        if (konamiIndexRef.current === KONAMI_CODE.length) {
          // Konami matched
          konamiIndexRef.current = 0; // Reset

          const now = Date.now();
          // 5 second cooldown
          if (now - konamiLastFiredRef.current > 5000) {
            konamiLastFiredRef.current = now;
            triggerMilestoneCelebration();
            toast({
              title: "Achievement Unlocked: 30 extra lives 🎮",
              description: "You found the Konami Code!",
              variant: "success",
              duration: 5000,
            });
          }
        }
      } else {
        // Reset if key doesn't match
        konamiIndexRef.current = 0;
      }
    }

    function handleMouseDown(e: MouseEvent) {
      // 3. Rage Click
      const now = Date.now();

      // Clean up old clicks (older than 1500ms)
      clicksRef.current = clicksRef.current.filter(time => now - time < 1500);

      clicksRef.current.push(now);

      if (clicksRef.current.length >= 5) {
        // Trigger celebration at cursor coordinates
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        triggerCelebrationAt(x, y, { intensity: 'medium' });

        // Reset to prevent continuous streaming if they keep clicking
        clicksRef.current = [];
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onDevOverlay, toast]);
}
