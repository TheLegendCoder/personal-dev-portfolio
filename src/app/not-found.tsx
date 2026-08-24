import Link from 'next/link';
import type { Metadata } from 'next';
import { Compass, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-28">
      <div className="text-center max-w-md space-y-4">
        <Compass className="h-12 w-12 text-primary mx-auto" />
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have
          moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
