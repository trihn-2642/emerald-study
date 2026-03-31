import { cn } from '@/lib/utils';

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-slate-100', className)} />
  );
}

export function OverallStatsRowSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Shimmer className="h-7 w-7 rounded-full" />
            <Shimmer className="h-3 w-24" />
          </div>
          <Shimmer className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function HeatmapSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1.5">
          <Shimmer className="h-4 w-36" />
          <Shimmer className="h-3 w-48" />
        </div>
      </div>
      <Shimmer className="h-24 w-full" />
    </div>
  );
}

export function FsrsBreakdownSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <Shimmer className="mb-1 h-4 w-40" />
      <Shimmer className="mb-4 h-3 w-32" />
      <Shimmer className="mb-5 h-3 w-full rounded-full" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3 w-12" />
            </div>
            <Shimmer className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeckStatsSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3.5">
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-3" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-4">
            <div className="grid grid-cols-6 items-center gap-4">
              <div className="flex items-center gap-3">
                <Shimmer className="h-8 w-8 shrink-0 rounded-lg" />
                <Shimmer className="h-4 w-24" />
              </div>
              <Shimmer className="h-4 w-8" />
              <Shimmer className="h-2 w-20 rounded-full" />
              <Shimmer className="h-4 w-12" />
              <Shimmer className="h-4 w-10" />
              <Shimmer className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
