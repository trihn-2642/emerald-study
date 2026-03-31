import { ActivityHeatmap } from '@/components/stats/ActivityHeatmap';
import { DeckStatsTable } from '@/components/stats/DeckStatsTable';
import { FsrsStateBreakdown } from '@/components/stats/FsrsStateBreakdown';
import { OverallStatsRow } from '@/components/stats/OverallStatsRow';
import {
  getActivityHeatmap,
  getDeckStats,
  getFsrsBreakdown,
  getOverallStats,
} from '@/lib/data/statistics';

type Props = { userId: string };

export async function OverallStatsSection({ userId }: Props) {
  const stats = await getOverallStats(userId);
  return <OverallStatsRow stats={stats} />;
}

export async function HeatmapSection({ userId }: Props) {
  const data = await getActivityHeatmap(userId);
  return <ActivityHeatmap data={data} />;
}

export async function FsrsSection({ userId }: Props) {
  const breakdown = await getFsrsBreakdown(userId);
  return <FsrsStateBreakdown breakdown={breakdown} />;
}

export async function DeckStatsSection({ userId }: Props) {
  const decks = await getDeckStats(userId);
  return (
    <>
      <div className="mb-3">
        <p className="text-sm font-bold text-slate-700">Thống kê theo bộ thẻ</p>
      </div>
      <DeckStatsTable decks={decks} />
    </>
  );
}
