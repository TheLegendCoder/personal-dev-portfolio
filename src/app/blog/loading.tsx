import { Skeleton } from '@/components/ui/skeleton';

export default function BlogLoading() {
  return (
    <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-2xl space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
