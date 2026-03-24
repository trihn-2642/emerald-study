import { RANKS } from '@/constants';

function getRank(xp: number) {
  let current: (typeof RANKS)[number] = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) current = rank;
  }
  return current;
}

function getProgressColor(percent: number): string {
  if (percent >= 100)
    return 'bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
  if (percent >= 67)
    return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
  if (percent >= 34) return 'bg-amber-400';
  return 'bg-red-400';
}

export { getRank, getProgressColor };
