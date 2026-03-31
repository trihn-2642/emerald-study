'use client';

import { BarChart3, Clock, Flame, Layers } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { CountUp } from '@/components/ui/count-up';

import type { OverallStats } from '@/lib/data/statistics';

type Props = {
  stats: OverallStats;
};

function formatTime(sec: number): { value: number; unit: string } {
  const hours = sec / 3600;
  if (hours >= 1) return { value: Math.round(hours * 10) / 10, unit: 'giờ' };
  return { value: Math.round(sec / 60), unit: 'phút' };
}

export function OverallStatsRow({ stats }: Props) {
  const time = formatTime(stats.total_time_sec);

  const cards = [
    {
      icon: Layers,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      label: 'Tổng số thẻ',
      value: stats.total_cards,
      suffix: '',
      unit: 'thẻ',
    },
    {
      icon: Flame,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      label: 'Chuỗi ngày',
      value: stats.current_streak,
      suffix: '',
      unit: 'ngày',
      highlight: stats.current_streak >= 7,
    },
    {
      icon: Clock,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      label: 'Thời gian học',
      value: time.value,
      suffix: '',
      unit: time.unit,
      formatter: (v: number) =>
        time.unit === 'giờ' ? v.toFixed(1) : String(Math.round(v)),
    },
    {
      icon: BarChart3,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      label: 'Độ chính xác',
      value: stats.avg_accuracy,
      suffix: '%',
      unit: '',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(
        ({
          icon: Icon,
          iconBg,
          iconColor,
          label,
          value,
          suffix,
          unit,
          formatter,
        }) => (
          <Card
            key={label}
            className="gap-2 rounded-2xl border-0 bg-white py-5 shadow-sm"
          >
            <CardContent className="px-5">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  {label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-800">
                  <CountUp
                    to={value}
                    suffix={suffix}
                    formatter={formatter as ((n: number) => string) | undefined}
                  />
                </span>
                {unit && (
                  <span className="text-sm font-semibold text-slate-400">
                    {unit}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}
