import dayjs from 'dayjs';

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

// Unified mastery/accuracy color: ≥80% green, ≥50% amber, <50% red
function getMasteryColor(percent: number): string {
  if (percent >= 80) return 'bg-emerald-500';
  if (percent >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

// Duration as a plain string: "2 giờ 30 phút" or "15 phút"
function formatDurationString(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} giờ ${m} phút`;
  return `${m} phút`;
}

// Duration as { value, unit } for use with CountUp display
function formatDurationParts(seconds: number): { value: string; unit: string } {
  const hours = seconds / 3600;
  if (hours >= 1) return { value: hours.toFixed(1), unit: 'giờ' };
  const minutes = Math.round(seconds / 60);
  return { value: String(minutes), unit: 'phút' };
}

// Format ISO date-time to two display lines (e.g. "Hôm nay, 09:17" / "31 tháng 3")
function formatStartedAt(iso: string): { line1: string; line2: string } {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' });

  if (isToday) return { line1: `Hôm nay, ${time}`, line2: date };
  if (isYesterday) return { line1: `Hôm qua, ${time}`, line2: date };
  return {
    line1: d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
    line2: time,
  };
}

// Format ISO date to Vietnamese relative label (e.g. "Hôm nay", "2 ngày trước")
function formatLastStudied(iso: string | null): string {
  if (!iso) return '—';
  const d = dayjs(iso);
  const today = dayjs().startOf('day');
  const diff = today.diff(d.startOf('day'), 'day');
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Hôm qua';
  if (diff < 7) return `${diff} ngày trước`;
  return d.format('DD/MM/YYYY');
}

export {
  getRank,
  getProgressColor,
  getMasteryColor,
  formatDurationString,
  formatDurationParts,
  formatStartedAt,
  formatLastStudied,
};
