import { Skeleton } from '@/components/ui/skeleton';

/** Matches the header + stats row + table shape shared by the admin list pages. */
export function AdminListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="bg-primary/5 border-b border-border px-4 py-3">
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3.5 flex items-center gap-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
