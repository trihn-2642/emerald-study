function TodayGoalSkeleton() {
  return (
    <div className="h-87 animate-pulse space-y-6 rounded-xl bg-white p-8">
      <div className="h-3 w-24 rounded bg-slate-100" />
      <div className="h-7 w-40 rounded bg-slate-100" />
      <div className="h-3 w-56 rounded bg-slate-100" />
      <div className="mt-auto space-y-2 pt-4">
        <div className="h-10 w-20 rounded bg-slate-100" />
        <div className="h-3 w-full rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function StreakSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-36 animate-pulse rounded-xl bg-emerald-700/20" />
      <div className="animate-pulse space-y-4 rounded-xl bg-white p-6">
        <div className="h-2.5 w-20 rounded bg-slate-100" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-slate-100" />
              <div className="h-3 w-36 rounded bg-slate-100" />
            </div>
            <div className="h-3 w-14 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DecksSkeleton() {
  return (
    <div className="space-y-8">
      {/* StatsRow skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-24 animate-pulse flex-col gap-3 rounded-xl bg-white p-4"
          >
            <div className="h-8 w-8 rounded-lg bg-slate-100" />
            <div className="h-4 w-16 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      {/* DeckGrid skeleton */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-52 animate-pulse space-y-4 rounded-xl bg-white p-6"
            >
              <div className="flex justify-between">
                <div className="h-5 w-12 rounded bg-slate-100" />
                <div className="h-5 w-4 rounded bg-slate-100" />
              </div>
              <div className="h-5 w-32 rounded bg-slate-100" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-4/5 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { TodayGoalSkeleton, StreakSkeleton, DecksSkeleton };
