import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { nowStatus } from '@/components/data/content';

const ROWS: { label: string; key: 'building' | 'learning' | 'exploring' }[] = [
  { label: 'Building', key: 'building' },
  { label: 'Learning', key: 'learning' },
  { label: 'Exploring', key: 'exploring' },
];

/**
 * Thin "Currently" strip linking through to /now. Renders nothing while
 * nowStatus is still blank, so the section can ship ahead of its copy without
 * leaving an empty band on the home page.
 */
export function Currently() {
  const rows = ROWS.filter((row) => nowStatus[row.key].trim().length > 0);
  if (rows.length === 0) return null;

  return (
    <section className="w-full pt-20 lg:pt-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto border-y border-border py-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1 flex flex-col gap-3">
            <h2 className="mono-label">Currently</h2>
            {rows.map((row) => (
              <p key={row.key} className="text-base text-foreground">
                <span className="mono-label mr-3 text-muted-foreground">{row.label}</span>
                {nowStatus[row.key]}
              </p>
            ))}
          </div>

          <Link
            href="/now"
            className="mono-label group inline-flex items-center text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            More on /now
            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
