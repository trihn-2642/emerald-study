import { getTodayStats } from '@/lib/data/dashboard';

import { TodayGoalWidget } from './TodayGoalWidget';

type Props = { userId: string };

export async function TodayGoalSection({ userId }: Props) {
  let reviewed = 0;
  let total = 0;

  try {
    const stats = await getTodayStats(userId);
    reviewed = stats.reviewed;
    total = stats.total;
  } catch {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-white p-8 text-sm text-slate-400">
        Không thể tải tiến độ hôm nay.
      </div>
    );
  }

  return <TodayGoalWidget reviewed={reviewed} total={total} />;
}
