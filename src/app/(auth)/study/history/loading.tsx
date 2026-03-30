export default function Loading() {
  return (
    <div className="animate-pulse p-4 md:p-6">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="mb-2 h-3 w-24 rounded bg-slate-100" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="h-8 w-52 rounded-lg bg-slate-100" />
          <div className="flex gap-2">
            <div className="h-9 w-40 rounded-lg bg-slate-100" />
            <div className="h-9 w-44 rounded-lg bg-slate-100" />
          </div>
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
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
        <div className="mb-5 flex items-center justify-between">
          <div className="h-5 w-36 rounded bg-slate-100" />
          <div className="h-4 w-20 rounded bg-slate-100" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-slate-50 pb-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100" />
                <div>
                  <div className="mb-1.5 h-4 w-36 rounded bg-slate-100" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
              </div>
              <div className="hidden gap-8 md:flex">
                <div className="h-4 w-20 rounded bg-slate-100" />
                <div className="h-4 w-16 rounded bg-slate-100" />
                <div className="h-4 w-20 rounded bg-slate-100" />
                <div className="h-4 w-24 rounded bg-slate-100" />
              </div>
              <div className="h-8 w-16 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
