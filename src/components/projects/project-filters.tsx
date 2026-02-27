'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CelebrationButton } from '@/components/ui/celebration-button';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Professional', value: 'professional' },
  { label: 'Personal', value: 'personal' },
] as const;

export function ProjectFilters({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="inline-flex bg-card rounded-full p-1 gap-2 shadow-lg">
      {FILTERS.map((filter) => (
        <CelebrationButton
          key={filter.value}
          type="button"
          onClick={() => handleFilter(filter.value)}
          celebrateOnClick
          celebrationIntensity="low"
          className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${
            current === filter.value
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          aria-label={`Show ${filter.label.toLowerCase()} projects`}
          aria-current={current === filter.value ? 'true' : undefined}
        >
          {filter.label}
        </CelebrationButton>
      ))}
    </div>
  );
}
