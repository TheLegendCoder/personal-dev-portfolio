'use client';

import { useEffect, useState } from 'react';
import { triggerMilestoneCelebration } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { prefersReducedMotion } from '@/lib/gsap';

interface ScrollCelebrationOptions {
  threshold?: number; // Percentage (0-100) of page to scroll before celebrating
  once?: boolean; // Only celebrate once per session
  message?: string;
}

export function useScrollCelebration(options: ScrollCelebrationOptions = {}) {
  const { threshold = 80, once = true, message } = options;
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    // Check localStorage if once is true
    if (once && typeof window !== 'undefined') {
      const celebrated = localStorage.getItem('scroll-celebration');
      if (celebrated) {
        setHasCelebrated(true);
        return;
      }
    }

    const handleScroll = () => {
      if (hasCelebrated) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

      if (scrollPercentage >= threshold) {
        // Trigger celebration
        triggerMilestoneCelebration();
        setHasCelebrated(true);

        // Show toast if message provided
        if (message) {
          toast({
            variant: "success",
            title: message,
            duration: 3000,
          });
        }

        // Store in localStorage if once is true
        if (once && typeof window !== 'undefined') {
          localStorage.setItem('scroll-celebration', 'true');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasCelebrated, threshold, once, message, toast]);

  return { hasCelebrated };
}
