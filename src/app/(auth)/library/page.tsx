import { Suspense } from 'react';

import { LibraryDecksSection } from '@/components/library/LibraryDecksSection';
import { LibraryStatsSection } from '@/components/library/LibraryStatsSection';
import {
  DeckGridSkeleton,
  LibraryStatsSkeleton,
} from '@/components/library/Skeleton';
import { getUser } from '@/lib/supabase/server';

export default async function LibraryPage() {
  const user = await getUser();

  return (
    <div className="p-4 md:p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-on-surface text-2xl font-bold">Thư viện của bạn</h1>
        <p className="text-on-muted mt-1 text-sm">
          Quản lý và ôn tập các bộ thẻ ghi nhớ ngôn ngữ.
        </p>
      </div>

      <Suspense fallback={<DeckGridSkeleton />}>
        <LibraryDecksSection userId={user.id} />
      </Suspense>

      <Suspense fallback={<LibraryStatsSkeleton />}>
        <LibraryStatsSection userId={user.id} />
      </Suspense>
    </div>
  );
}
