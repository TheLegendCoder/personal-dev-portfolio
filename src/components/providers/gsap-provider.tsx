'use client';

import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Registers GSAP plugins and handles cleanup on unmount.
 * Must be rendered on the client — wrap the root layout body.
 */
export function GSAPProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure plugins are registered (safe to call multiple times)
    gsap.registerPlugin(ScrollTrigger);

    // Refresh ScrollTrigger after fonts/images may have shifted layout
    ScrollTrigger.refresh();

    return () => {
      // Kill all ScrollTrigger instances on unmount / route change
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}
