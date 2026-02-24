'use client';

import { useEffect, useRef } from 'react';
import { magneticHover } from '@/lib/gsap';

interface MagneticButtonProps {
  children: React.ReactNode;
  /** Magnetic pull strength 0–1 (default 0.35) */
  strength?: number;
  className?: string;
}

/**
 * Wraps any element with a magnetic hover effect using GSAP.
 * The child element is translated toward the cursor on hover
 * and snaps back on mouse leave.
 */
export function MagneticButton({
  children,
  strength = 0.35,
  className,
}: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    // Attach to the first child element for more precise tracking
    const target = (el.firstElementChild as HTMLElement) ?? el;
    const cleanup = magneticHover(target, strength);
    return cleanup;
  }, [strength]);

  return (
    <div ref={wrapperRef} className={className} style={{ display: 'inline-block' }}>
      {children}
    </div>
  );
}
