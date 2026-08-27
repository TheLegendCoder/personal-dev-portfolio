import Link from 'next/link';
import type { WritingType } from '@/lib/writing';

const TABS: { label: string; value: WritingType | 'all'; href: string }[] = [
  { label: 'All', value: 'all', href: '/writing' },
  { label: 'Articles', value: 'article', href: '/writing?type=articles' },
  { label: 'Tutorials', value: 'tutorial', href: '/writing?type=tutorials' },
];

/**
 * Plain links rather than a client-side filter — the list is server-rendered per
 * `?type=`, so there is no state to hold and no reason to ship JS for this.
 * Visual treatment matches ProjectFilters on /projects.
 */
export function WritingTabs({ current }: { current: WritingType | 'all' }) {
  return (
    <div className="inline-flex bg-card rounded-full p-1 gap-2 shadow-lg">
      {TABS.map((tab) => (
        <Link
          key={tab.value}
          href={tab.href}
          scroll={false}
          aria-current={current === tab.value ? 'true' : undefined}
          className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${
            current === tab.value
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
