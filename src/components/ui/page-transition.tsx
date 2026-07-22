'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'slide-up' | 'cascade' | 'bounce';
}

export function PageTransition({ children, variant = 'cascade' }: PageTransitionProps) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setIsAnimating(true);
    setKey((prev) => prev + 1);
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  const variantClasses = {
    fade: {
      initial: 'opacity-0',
      animate: 'opacity-100',
    },
    'slide-up': {
      initial: 'opacity-0 translate-y-4',
      animate: 'opacity-100 translate-y-0',
    },
    cascade: {
      initial: 'opacity-0 translate-y-2',
      animate: 'opacity-100 translate-y-0',
    },
    bounce: {
      initial: 'opacity-0 scale-95',
      animate: 'opacity-100 scale-100',
    },
  };

  const classes = variantClasses[variant];

  return (
    <div
      key={key}
      className={cn(
        'transition-all duration-500 ease-out',
        isAnimating ? classes.initial : classes.animate,
        variant === 'bounce' && !isAnimating && 'animate-fade-up'
      )}
    >
      {children}
    </div>
  );
}
