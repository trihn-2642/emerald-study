// --------------------------------------------------------------------------
// Rank tiers — used in StreakBanner & getRank() utility
// XP = streak * XP_PER_STREAK_DAY
// --------------------------------------------------------------------------
export const RANKS = [
  { name: 'Học viên', minXp: 0, next: 'Đồng' },
  { name: 'Đồng', minXp: 60, next: 'Bạc' },
  { name: 'Bạc', minXp: 150, next: 'Vàng' },
  { name: 'Vàng', minXp: 300, next: 'Kim Cương I' },
  { name: 'Kim Cương I', minXp: 510, next: 'Kim Cương II' },
  { name: 'Kim Cương II', minXp: 750, next: 'Kim Cương III' },
  { name: 'Kim Cương III', minXp: 1050, next: 'Master' },
  { name: 'Master', minXp: 1500, next: null },
] as const;

// XP earned per streak day
export const XP_PER_STREAK_DAY = 30;

// --------------------------------------------------------------------------
// Language badge labels — used in DeckCard
// --------------------------------------------------------------------------
export const LANGUAGE_LABELS: Record<
  string,
  { label: string; className: string }
> = {
  zh: { label: 'CN/VN', className: 'bg-emerald-50 text-emerald-700' },
  en: { label: 'EN/VN', className: 'bg-blue-50 text-blue-700' },
};

export const REGEXS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
