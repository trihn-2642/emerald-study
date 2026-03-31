'use client';

import dayjs from 'dayjs';

import { cn } from '@/lib/utils';

import type { HeatmapData } from '@/lib/data/statistics';

type Props = {
  data: HeatmapData;
};

const MONTHS_VN = [
  'Th1',
  'Th2',
  'Th3',
  'Th4',
  'Th5',
  'Th6',
  'Th7',
  'Th8',
  'Th9',
  'Th10',
  'Th11',
  'Th12',
];
const DAY_LABELS = ['T2', '', 'T4', '', 'T6', '', 'CN'];

function getCellColor(count: number): string {
  if (count === 0) return 'bg-slate-100';
  if (count <= 5) return 'bg-emerald-100';
  if (count <= 15) return 'bg-emerald-300';
  if (count <= 30) return 'bg-emerald-500';
  return 'bg-emerald-700';
}

function buildWeeks(
  data: HeatmapData,
  year: number,
): {
  weeks: Array<Array<{ date: string; count: number; future: boolean } | null>>;
  startMonday: ReturnType<typeof dayjs>;
} {
  const today = dayjs().startOf('day');
  const jan1 = dayjs(`${year}-01-01`);
  const jan1Dow = jan1.day();
  const daysToMonday = (jan1Dow + 6) % 7;
  const startMonday = jan1.subtract(daysToMonday, 'day');

  const dec31 = dayjs(`${year}-12-31`);
  const endDow = dec31.day();
  const endSunday = dec31.add((7 - endDow) % 7, 'day');
  const totalWeeks = endSunday.diff(startMonday, 'week') + 1;

  const weeks: Array<
    Array<{ date: string; count: number; future: boolean } | null>
  > = [];
  let current = startMonday;

  for (let w = 0; w < totalWeeks; w++) {
    const week: Array<{
      date: string;
      count: number;
      future: boolean;
    } | null> = [];
    for (let d = 0; d < 7; d++) {
      const day = current.add(d, 'day');
      if (day.year() !== year) {
        week.push(null);
      } else {
        const dateStr = day.format('YYYY-MM-DD');
        week.push({
          date: dateStr,
          count: data[dateStr] ?? 0,
          future: day.isAfter(today),
        });
      }
    }
    weeks.push(week);
    current = current.add(1, 'week');
  }
  return { weeks, startMonday };
}

function buildMonthLabels(year: number, startMonday: ReturnType<typeof dayjs>) {
  const labels: { weekIdx: number; label: string }[] = [];
  for (let m = 0; m < 12; m++) {
    const firstOfMonth = dayjs(`${year}-${String(m + 1).padStart(2, '0')}-01`);
    const weekIdx = Math.floor(firstOfMonth.diff(startMonday, 'day') / 7);
    if (weekIdx >= 0) {
      labels.push({ weekIdx, label: MONTHS_VN[m] });
    }
  }
  return labels;
}

export function ActivityHeatmap({ data }: Props) {
  const year = dayjs().year();
  const { weeks, startMonday } = buildWeeks(data, year);
  const monthLabels = buildMonthLabels(year, startMonday);

  const totalActive = Object.values(data).reduce((s, v) => s + v, 0);
  const activeDays = Object.keys(data).length;

  return (
    <div className="min-w-0 rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-700">Hoạt động học tập</p>
          <p className="text-xs text-slate-400">
            {activeDays} ngày có học · {totalActive.toLocaleString('vi-VN')} thẻ
            trong năm {year}
          </p>
        </div>
        {/* Legend */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <span className="text-[11px] text-slate-400">Ít</span>
          {[
            'bg-slate-100',
            'bg-emerald-100',
            'bg-emerald-300',
            'bg-emerald-500',
            'bg-emerald-700',
          ].map((cls) => (
            <div key={cls} className={cn('h-3 w-3 rounded-xs', cls)} />
          ))}
          <span className="text-[11px] text-slate-400">Nhiều</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="relative mb-1 h-3 pl-7">
            {monthLabels.map(({ weekIdx, label }) => (
              <span
                key={weekIdx}
                className="absolute text-[9px] text-slate-400"
                style={{ left: `${28 + weekIdx * 13}px` }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-px">
            {/* Day labels */}
            <div className="mr-1 flex flex-col gap-px">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="h-3 w-5 text-right text-[9px] leading-3 text-slate-400"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-px">
                {week.map((cell, di) =>
                  cell === null ? (
                    <div
                      key={di}
                      className="h-3 w-3 rounded-xs bg-transparent"
                    />
                  ) : cell.future ? (
                    <div key={di} className="h-3 w-3 rounded-xs bg-slate-50" />
                  ) : (
                    <div
                      key={di}
                      className={cn(
                        'h-3 w-3 rounded-xs transition-opacity hover:opacity-70',
                        getCellColor(cell.count),
                      )}
                      title={`${cell.date}: ${cell.count} thẻ`}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
