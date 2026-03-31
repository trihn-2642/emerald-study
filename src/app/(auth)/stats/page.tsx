import { BarChart3 } from 'lucide-react';
import { Suspense } from 'react';

import {
  DeckStatsSkeleton,
  FsrsBreakdownSkeleton,
  HeatmapSkeleton,
  OverallStatsRowSkeleton,
} from '@/components/stats/Skeleton';
import {
  DeckStatsSection,
  FsrsSection,
  HeatmapSection,
  OverallStatsSection,
} from '@/components/stats/StatsSections';
import { getUser } from '@/lib/supabase/server';

export default async function StatisticsPage() {
  const user = await getUser();

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header — renders immediately */}
      <div>
        <div className="mb-1 flex items-center gap-2.5">
          <BarChart3 className="h-6 w-6 text-emerald-600" />
          <h1 className="text-on-surface text-3xl font-black tracking-tight">
            Thống kê học tập
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Phân tích chi tiết tiến độ chinh phục ngôn ngữ của bạn.
        </p>
      </div>

      <Suspense fallback={<OverallStatsRowSkeleton />}>
        <OverallStatsSection userId={user.id} />
      </Suspense>

      {/*
        lg (laptop): row1=heatmap full | row2=fsrs(2/5) + deck(3/5)
        xl (PC):     row1=heatmap(3/5) + fsrs(2/5) | row2=deck full
      */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Heatmap: full width on lg, 3/5 on xl (row 1) */}
        <div className="min-w-0 lg:col-span-5 xl:col-span-3 xl:row-start-1">
          <Suspense fallback={<HeatmapSkeleton />}>
            <HeatmapSection userId={user.id} />
          </Suspense>
        </div>

        {/* FSRS: 2/5 on lg, cols 4–5 on xl (row 1) — explicit col-start prevents wrong order */}
        <div className="lg:col-span-2 xl:col-span-2 xl:col-start-4 xl:row-start-1">
          <Suspense fallback={<FsrsBreakdownSkeleton />}>
            <FsrsSection userId={user.id} />
          </Suspense>
        </div>

        {/* Deck stats: 3/5 on lg, full width on xl (row 2) */}
        <div className="lg:col-span-3 xl:col-span-5 xl:row-start-2">
          <Suspense fallback={<DeckStatsSkeleton />}>
            <DeckStatsSection userId={user.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
