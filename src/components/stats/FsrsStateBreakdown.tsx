'use client';

import { AnimatedProgress } from '@/components/ui/animated-progress';
import { CountUp } from '@/components/ui/count-up';

import type { FsrsBreakdown } from '@/lib/data/statistics';

type Props = {
  breakdown: FsrsBreakdown;
};

const STATES = [
  {
    key: 'new' as const,
    label: 'Mới',
    desc: 'Chưa học lần nào',
    color: 'bg-slate-400',
    textColor: 'text-slate-600',
    barClass: 'bg-slate-400',
    dotClass: 'bg-slate-400',
  },
  {
    key: 'learning' as const,
    label: 'Đang học',
    desc: 'Đang trong giai đoạn học',
    color: 'bg-amber-400',
    textColor: 'text-amber-600',
    barClass: 'bg-amber-400',
    dotClass: 'bg-amber-400',
  },
  {
    key: 'review' as const,
    label: 'Đã thuộc',
    desc: 'Đã vào chu kỳ ôn tập',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    barClass: 'bg-emerald-500',
    dotClass: 'bg-emerald-500',
  },
  {
    key: 'relearning' as const,
    label: 'Cần học lại',
    desc: 'Đã quên, cần ôn lại',
    color: 'bg-red-400',
    textColor: 'text-red-500',
    barClass: 'bg-red-400',
    dotClass: 'bg-red-400',
  },
];

export function FsrsStateBreakdown({ breakdown }: Props) {
  const total =
    breakdown.new +
    breakdown.learning +
    breakdown.review +
    breakdown.relearning;

  const getPct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="mb-1 text-sm font-bold text-slate-700">
        Phân bố trạng thái thẻ
      </p>
      <p className="mb-4 text-xs text-slate-400">
        Tổng{' '}
        <span className="font-bold text-slate-600">
          {total.toLocaleString('vi-VN')}
        </span>{' '}
        thẻ theo thuật toán FSRS
      </p>

      {/* Stacked bar */}
      <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
        {STATES.map(({ key, color }) => {
          const pct = getPct(breakdown[key]);
          return pct > 0 ? (
            <div
              key={key}
              className={`${color} h-full transition-all`}
              style={{ width: `${pct}%` }}
            />
          ) : null;
        })}
      </div>

      {/* State rows */}
      <div className="space-y-3.5">
        {STATES.map(({ key, label, desc, dotClass, barClass, textColor }) => {
          const count = breakdown[key];
          const pct = getPct(count);
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                  <span className="text-xs font-semibold text-slate-600">
                    {label}
                  </span>
                  <span className="hidden text-[10px] text-slate-400 sm:inline">
                    {desc}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm font-black ${textColor}`}>
                    <CountUp to={count} />
                  </span>
                  <span className="text-[11px] text-slate-400">thẻ</span>
                  <span className="text-[11px] text-slate-300">· {pct}%</span>
                </div>
              </div>
              <AnimatedProgress
                value={pct}
                className="h-1.5 bg-slate-100"
                indicatorClassName={barClass}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
