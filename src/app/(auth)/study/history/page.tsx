import { ChevronRight, History } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import {
  HistorySection,
  HistorySkeleton,
} from '@/components/study/HistorySection';
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

  return (
    <div className="p-4 md:p-6">
      {/* Breadcrumb — renders immediately */}
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

      {/* Header — renders immediately */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5">
          <History className="h-6 w-6 text-emerald-600" />
          <h1 className="text-on-surface text-3xl font-black tracking-tight">
            Lịch sử phiên học
          </h1>
        </div>
      </div>

      {/* Filters + Stats + Table — stream in */}
      <Suspense fallback={<HistorySkeleton />}>
        <HistorySection
          userId={user.id}
          deckId={deckId}
          period={period}
          page={page}
          limit={LIMIT}
          currentDeck={deck ?? 'all'}
        />
      </Suspense>
    </div>
  );
}
