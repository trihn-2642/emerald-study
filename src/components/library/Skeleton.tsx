function DeckCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      {/* Top row: icon + ring */}
      <div className="mb-4 flex items-start justify-between">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-12 w-12 animate-pulse rounded-full bg-slate-100" />
      </div>
      {/* Deck name */}
      <div className="mb-1 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
      <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      {/* Badges */}
      <div className="flex gap-1.5">
        <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
        <div className="h-5 w-14 animate-pulse rounded-full bg-slate-100" />
      </div>
      {/* Card count */}
      <div className="mt-2 h-3 w-12 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

function DeckGridSkeleton() {
  return (
    <div>
      {/* Controls row */}
      <div className="mb-5 flex items-center gap-2">
        <div className="h-8 w-20 animate-pulse rounded-full bg-white" />
        <div className="h-8 w-28 animate-pulse rounded-full bg-white" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-white" />
        <div className="flex-1" />
        <div className="h-8 w-36 animate-pulse rounded-xl bg-white" />
        <div className="h-8 w-28 animate-pulse rounded-xl bg-white" />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DeckCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function StatTileSkeleton() {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      {/* Icon + label */}
      <div className="mb-1 flex items-center gap-1.5">
        <div className="h-3.5 w-3.5 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
      </div>
      {/* Big number */}
      <div className="mb-1 h-6 w-12 animate-pulse rounded bg-slate-200" />
      {/* Subtitle */}
      <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

function LibraryStatsSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* CTA card skeleton */}
      <div className="rounded-2xl bg-white p-6">
        {/* Badge */}
        <div className="mb-3 h-5 w-32 animate-pulse rounded-full bg-slate-300" />
        {/* Title */}
        <div className="mb-2 h-7 w-4/5 animate-pulse rounded bg-slate-300" />
        <div className="mb-5 h-4 w-2/3 animate-pulse rounded bg-slate-300" />
        {/* Button */}
        <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-300" />
      </div>

      {/* Quick stats card skeleton */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        {/* Section header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-4 w-4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <StatTileSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export { DeckGridSkeleton, LibraryStatsSkeleton };
