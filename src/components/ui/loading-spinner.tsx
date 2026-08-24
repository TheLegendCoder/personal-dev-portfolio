'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import styles from './loading-spinner.module.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'pulse' | 'bounce' | 'dots';
}

// Context-aware loading messages
const loadingMessages = {
  projects: [
    'Finding your projects...',
    'Loading amazing work...',
    'Almost there...',
    'Gathering portfolio pieces...',
  ],
  blog: [
    'Brewing fresh content...',
    'Gathering insights...',
    'One moment...',
    'Loading articles...',
  ],
  general: [
    'Loading...',
    'Just a moment...',
    'Almost ready...',
  ],
};

function getRandomMessage(context: keyof typeof loadingMessages = 'general'): string {
  const messages = loadingMessages[context];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function LoadingSpinner({ size = 'md', className, variant = 'default' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  if (variant === 'pulse') {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-r from-primary via-accent to-primary animate-pulse-glow',
          sizeClasses[size],
          className
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (variant === 'bounce') {
    return (
      <div className={cn('flex items-center gap-1.5', className)} role="status" aria-label="Loading">
        <span className={cn('rounded-full bg-primary animate-bounce', sizeClasses[size], styles.bounceDot0)} />
        <span className={cn('rounded-full bg-accent animate-bounce', sizeClasses[size], styles.bounceDot150ms)} />
        <span className={cn('rounded-full bg-primary animate-bounce', sizeClasses[size], styles.bounceDot300ms)} />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1', className)} role="status" aria-label="Loading">
        <div className={cn('rounded-full bg-primary animate-bounce', 'h-2 w-2', styles.dot0s)} />
        <div className={cn('rounded-full bg-accent animate-bounce', 'h-2 w-2', styles.dot015s)} />
        <div className={cn('rounded-full bg-primary animate-bounce', 'h-2 w-2', styles.dot03s)} />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface PageLoadingProps {
  message?: string;
  context?: keyof typeof loadingMessages;
  className?: string;
  variant?: 'default' | 'pulse' | 'bounce' | 'dots';
}

export function PageLoading({ message, context = 'general', className, variant = 'bounce' }: PageLoadingProps) {
  const [displayMessage, setDisplayMessage] = useState(message || getRandomMessage(context));

  useEffect(() => {
    if (!message) {
      // Rotate messages every 2 seconds
      const interval = setInterval(() => {
        setDisplayMessage(getRandomMessage(context));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [message, context]);

  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[200px] space-y-4 animate-fade-in', className)}>
      <LoadingSpinner size="lg" className="text-primary" variant={variant} />
      <p className="text-sm text-muted-foreground animate-pulse transition-all duration-300">{displayMessage}</p>
    </div>
  );
}

interface FullPageLoadingProps {
  message?: string;
  context?: keyof typeof loadingMessages;
  variant?: 'default' | 'pulse' | 'bounce' | 'dots';
}

export function FullPageLoading({ message, context = 'general', variant = 'pulse' }: FullPageLoadingProps) {
  const [displayMessage, setDisplayMessage] = useState(message || getRandomMessage(context));

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        setDisplayMessage(getRandomMessage(context));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [message, context]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center justify-center space-y-6 rounded-lg bg-card p-12 shadow-xl border border-primary/20 animate-fade-up">
        <LoadingSpinner size="lg" className="text-primary" variant={variant} />
        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground animate-pulse transition-all duration-300">{displayMessage}</p>
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary via-accent to-primary animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
