'use client';

import Link from 'next/link';

import { AnimatedProgress } from '@/components/ui/animated-progress';
import { CountUp } from '@/components/ui/count-up';
import { ROUTES } from '@/lib/routes';
import { getProgressColor } from '@/utils';

type Props = {
  reviewed: number;
  total: number;
};

export function TodayGoalWidget({ reviewed, total }: Props) {
  const percent =
    total > 0 ? Math.min(Math.round((reviewed / total) * 100), 100) : 0;
  const remaining = total - reviewed;
  const isDone = reviewed >= total && total > 0;

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-[0_20px_40px_rgba(11,28,48,0.05)]">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-emerald-500/5 transition-transform group-hover:scale-110" />

      <div className="flex h-full flex-col justify-between gap-8">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
            Tiến độ hằng ngày
          </span>
          <h3 className="text-on-surface mt-2 text-3xl font-extrabold">
            Mục tiêu hôm nay
          </h3>
          <p className="mt-3 text-sm text-slate-400">
            {isDone
              ? 'Tuyệt vời! Bạn đã hoàn thành mục tiêu hôm nay 🎉'
              : total === 0
                ? 'Không có thẻ nào cần ôn hôm nay.'
                : `Sắp hoàn thành rồi! Còn ${remaining} thẻ nữa thôi.`}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-emerald-700">
                <CountUp to={reviewed} />
              </span>
              <span className="font-medium text-slate-400">/ {total} thẻ</span>
            </div>
            <span className="text-sm font-bold text-emerald-600">
              {percent}%
            </span>
          </div>
          <AnimatedProgress
            value={percent}
            className="bg-surface-input h-3"
            indicatorClassName={getProgressColor(percent)}
          />
        </div>

        <div className="pt-1">
          <Link
            href={ROUTES.LIBRARY}
            className="from-brand-deep inline-flex items-center rounded-lg bg-linear-to-br to-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 active:scale-95"
          >
            {isDone ? 'Xem thư viện' : 'Tiếp tục học ngay'}
          </Link>
        </div>
      </div>
    </div>
  );
}
