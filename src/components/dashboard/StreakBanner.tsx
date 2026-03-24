import { Flame } from 'lucide-react';

import { XP_PER_STREAK_DAY } from '@/constants';
import { getRank } from '@/utils';

type Props = {
  streak: number;
};

export function StreakBanner({ streak }: Props) {
  const xp = streak * XP_PER_STREAK_DAY;
  const rank = getRank(xp);

  return (
    <div className="relative overflow-hidden rounded-xl bg-emerald-700 px-6 py-5 text-white">
      <span className="pointer-events-none absolute -right-2 -bottom-2 text-[80px] leading-none opacity-20 select-none">
        💎
      </span>

      <div className="space-y-1">
        <div className="flex items-start justify-between">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-80">
            Thứ hạng tuần
          </p>
          <span className="text-xs font-bold text-white">{xp} XP</span>
        </div>
        <h4 className="text-2xl font-bold">{rank.name}</h4>
        {rank.next && (
          <p className="text-xs opacity-75">Tiếp theo: {rank.next}</p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5 border-t border-white/20 pt-3">
        <Flame className="h-4 w-4 text-orange-300" fill="currentColor" />
        <span className="text-lg font-black">{streak}</span>
        <span className="text-xs opacity-75">ngày liên tiếp</span>
      </div>
    </div>
  );
}
