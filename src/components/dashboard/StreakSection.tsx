import { getUserStreak, getRecentActivity } from '@/lib/data/dashboard';

import { ActivityFeed } from './ActivityFeed';
import { StreakBanner } from './StreakBanner';

type Props = { userId: string };

export async function StreakSection({ userId }: Props) {
  let streak = 0;
  let activities: Awaited<ReturnType<typeof getRecentActivity>> = [];

  try {
    [streak, activities] = await Promise.all([
      getUserStreak(userId),
      getRecentActivity(userId),
    ]);
  } catch {
    return (
      <div className="flex h-full min-h-36 items-center justify-center rounded-xl bg-emerald-700 text-sm text-emerald-200">
        Không thể tải dữ liệu.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StreakBanner streak={streak} />
      <ActivityFeed activities={activities} />
    </div>
  );
}
