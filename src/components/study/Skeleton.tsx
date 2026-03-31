export function HistorySkeleton() {
  return (
    <div className="animate-pulse">
      {/* Filters skeleton */}
      <div className="mb-6 flex justify-end gap-2">
        <div className="h-9 w-40 rounded-lg bg-slate-100" />
        <div className="h-9 w-44 rounded-lg bg-slate-100" />
      </div>

      {/* Stats row skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-slate-100" />
              <div className="h-3 w-28 rounded bg-slate-100" />
            </div>
            <div className="h-9 w-24 rounded bg-slate-100" />
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-5 h-5 w-40 rounded bg-slate-100" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="h-4 w-32 rounded bg-slate-100" />
              <div className="h-4 w-20 rounded bg-slate-100" />
              <div className="h-4 w-16 rounded bg-slate-100" />
              <div className="h-4 w-16 rounded bg-slate-100" />
              <div className="ml-auto h-4 w-24 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
