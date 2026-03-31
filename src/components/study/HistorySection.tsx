import { HistoryFilters } from '@/components/study/HistoryFilters';
import { HistoryStatsRow } from '@/components/study/HistoryStatsRow';
import { HistoryTable } from '@/components/study/HistoryTable';
import { getStudyHistory } from '@/lib/data/history';

export { HistorySkeleton } from '@/components/study/Skeleton';

import type { Period } from '@/lib/data/history';

type Props = {
  userId: string;
  deckId: string | undefined;
  period: Period;
  page: number;
  limit: number;
  currentDeck: string;
};

export async function HistorySection({
  userId,
  deckId,
  period,
  page,
  limit,
  currentDeck,
}: Props) {
  const data = await getStudyHistory(userId, { deckId, period, page, limit });

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <HistoryFilters
          decks={data.decks}
          currentDeck={currentDeck}
          currentPeriod={period}
        />
      </div>

      {/* Stats row */}
      <div className="mb-8">
        <HistoryStatsRow
          stats={data.stats}
          prev_stats={data.prev_stats}
          period={period}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Chi tiết phiên học</h2>
        </div>
        <HistoryTable
          sessions={data.sessions}
          total={data.total}
          page={page}
          limit={limit}
        />
      </div>
    </>
  );
}
