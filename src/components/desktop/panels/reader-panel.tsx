'use client';

interface ReaderPanelProps {
  kind: 'blog' | 'tutorials';
}

export function ReaderPanel({ kind }: ReaderPanelProps) {
  return (
    <div className="flex h-full items-center justify-center bg-background text-sm text-muted-foreground">
      {kind === 'blog' ? 'Blog' : 'Tutorials'} reader — coming soon
    </div>
  );
}
