import { BookOpen, CheckCircle, Clock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import type { Period, PeriodStats } from '@/lib/data/history';

type Props = {
  stats: PeriodStats;
  prev_stats: PeriodStats | null;
  period: Period;
};

function formatDuration(seconds: number): { value: string; unit: string } {
  const hours = seconds / 3600;
  if (hours >= 1) return { value: hours.toFixed(1), unit: 'giờ' };
  const minutes = Math.round(seconds / 60);
  return { value: String(minutes), unit: 'phút' };
}

function TrendBadge({
  current,
  previous,
}: {
  current: number;
  previous: number | undefined;
}) {
  if (!previous || previous === 0) return null;
  const diff = Math.round(((current - previous) / previous) * 100);
  if (diff === 0) return null;
  const positive = diff > 0;
  return (
    <span
      className={`text-xs font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}
    >
      {positive ? '↑' : '↓'} {Math.abs(diff)}% so với trước
    </span>
  );
}

export function HistoryStatsRow({ stats, prev_stats, period }: Props) {
  const showTrend = period !== 'all';
  const timeFormatted = formatDuration(stats.total_time_sec);
  const totalTimeProgress = Math.min(
    (stats.total_time_sec / (7 * 3600)) * 100,
    100,
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Card 1: Total time */}
      <Card className="gap-3 rounded-2xl border-0 bg-white py-5 shadow-sm">
        <CardContent className="px-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
              <Clock className="h-4 w-4 text-emerald-600" />
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Tổng thời gian học
            </span>
          </div>
          <div className="mb-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-800">
              {timeFormatted.value}
            </span>
            <span className="text-sm font-semibold text-slate-400">
              {timeFormatted.unit}
            </span>
          </div>
          <Progress
            value={totalTimeProgress}
            className="mt-3 h-1.5 bg-emerald-50"
            indicatorClassName="bg-emerald-500"
          />
        </CardContent>
      </Card>

      {/* Card 2: Cards reviewed */}
      <Card className="gap-3 rounded-2xl border-0 bg-white py-5 shadow-sm">
        <CardContent className="px-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Số thẻ đã ôn
            </span>
          </div>
          <div className="mb-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-800">
              {stats.total_reviewed.toLocaleString('vi-VN')}
            </span>
            <span className="text-sm font-semibold text-slate-400">thẻ</span>
          </div>
          {showTrend && (
            <div className="mt-1">
              <TrendBadge
                current={stats.total_reviewed}
                previous={prev_stats?.total_reviewed}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 3: Accuracy */}
      <Card className="gap-3 rounded-2xl border-0 bg-white py-5 shadow-sm">
        <CardContent className="px-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Độ chính xác TB
            </span>
          </div>
          <div className="mb-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-800">
              {stats.avg_accuracy}
            </span>
            <span className="text-sm font-semibold text-slate-400">%</span>
          </div>
          {/* Segmented progress: green = correct, yellow = hard, red = again — 
              simplified as a single bar since we only have avg_accuracy */}
          <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${stats.avg_accuracy}%` }}
            />
            {stats.avg_accuracy > 0 && (
              <div
                className="bg-amber-400 transition-all"
                style={{
                  width: `${Math.max(0, Math.min(15, 100 - stats.avg_accuracy - 5))}%`,
                }}
              />
            )}
            <div className="flex-1 bg-slate-100" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
