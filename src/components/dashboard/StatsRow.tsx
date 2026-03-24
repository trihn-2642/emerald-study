'use client';

import { Layers, Clock, BookCheck, Sparkles } from 'lucide-react';

import { CountUp } from '@/components/ui/count-up';

type Props = {
  totalCards: number;
  dueToday: number;
  masteryPercent: number;
  newCards: number;
};

export function StatsRow({
  totalCards,
  dueToday,
  masteryPercent,
  newCards,
}: Props) {
  const stats = [
    {
      icon: Layers,
      label: 'Tổng thẻ',
      value: totalCards,
      suffix: '',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Clock,
      label: 'Đến hạn hôm nay',
      value: dueToday,
      suffix: '',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      icon: Sparkles,
      label: 'Thẻ mới',
      value: newCards,
      suffix: '',
      color: 'text-violet-500',
      bg: 'bg-violet-50',
    },
    {
      icon: BookCheck,
      label: 'Đã thuộc',
      value: masteryPercent,
      suffix: '%',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, suffix, color, bg }) => (
        <div
          key={label}
          className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm"
        >
          <div
            className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center`}
          >
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <div>
            <p className={`text-on-surface text-xl font-black ${color}`}>
              <CountUp to={value} suffix={suffix} />
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
