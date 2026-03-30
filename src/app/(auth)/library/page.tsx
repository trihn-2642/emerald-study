import { BookOpen } from 'lucide-react';
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
        <div className="mb-1 flex items-center gap-2.5">
          <BookOpen className="h-6 w-6 text-emerald-600" />
          <h1 className="text-on-surface text-3xl font-black tracking-tight">
            Thư viện của bạn
          </h1>
        </div>
        <p className="text-on-muted text-sm">
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
