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
    </div>
  );
}
