import { ChevronRight, History } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { HistoryFilters } from '@/components/study/HistoryFilters';
import { HistoryStatsRow } from '@/components/study/HistoryStatsRow';
import { HistoryTable } from '@/components/study/HistoryTable';
import { getStudyHistory } from '@/lib/data/history';
import { getUser } from '@/lib/supabase/server';

import type { Period } from '@/lib/data/history';

const LIMIT = 10;

type Props = {
  searchParams: Promise<{
    deck?: string;
    period?: string;
    page?: string;
  }>;
};

export default async function StudyHistoryPage({ searchParams }: Props) {
  const { deck, period: periodParam, page: pageParam } = await searchParams;

  const user = await getUser();
  const period: Period =
    periodParam === 'month' || periodParam === 'all' ? periodParam : 'week';
  const deckId = deck && deck !== 'all' ? deck : undefined;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));

  const data = await getStudyHistory(user.id, {
    deckId,
    period,
    page,
    limit: LIMIT,
  });

  return (
    <div className="p-4 md:p-6">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link
          href="/study"
          className="transition-colors hover:text-emerald-600"
        >
          Phiên học
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-on-surface font-semibold">Lịch sử phiên học</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <History className="h-6 w-6 text-emerald-600" />
            <h1 className="text-on-surface text-3xl font-black tracking-tight">
              Lịch sử phiên học
            </h1>
          </div>
          {/* Filters */}
          <Suspense>
            <HistoryFilters
              decks={data.decks}
              currentDeck={deck ?? 'all'}
              currentPeriod={period}
            />
          </Suspense>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-8">
        <HistoryStatsRow
          stats={data.stats}
          prev_stats={data.prev_stats}
          period={period}
        />
      </div>

      {/* Table section */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Chi tiết phiên học</h2>
        </div>
        <HistoryTable
          sessions={data.sessions}
          total={data.total}
          page={page}
          limit={LIMIT}
        />
      </div>
    </div>
  );
}
