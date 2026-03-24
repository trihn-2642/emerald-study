import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { DecksSection } from '@/components/dashboard/DecksSection';
import {
  DecksSkeleton,
  StreakSkeleton,
  TodayGoalSkeleton,
} from '@/components/dashboard/Skeleton';
import { StreakSection } from '@/components/dashboard/StreakSection';
import { TodayGoalSection } from '@/components/dashboard/TodayGoalSection';
import { getUser } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const user = await getUser();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8">
      {/* Bento grid: goal widget + streak — stream independently */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Suspense fallback={<TodayGoalSkeleton />}>
            <TodayGoalSection userId={user.id} />
          </Suspense>
        </div>
        <div className="lg:col-span-4">
          <Suspense fallback={<StreakSkeleton />}>
            <StreakSection userId={user.id} />
          </Suspense>
        </div>
      </div>

      {/* Stats + Deck grid — stream together since they share the same fetch */}
      <Suspense fallback={<DecksSkeleton />}>
        <DecksSection userId={user.id} />
      </Suspense>

      {/* Floating Action Button */}
      <Link
        href="/cards/new"
        className="fixed right-6 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-colors hover:bg-emerald-700 active:scale-90 md:bottom-8"
        aria-label="Thêm thẻ mới"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
