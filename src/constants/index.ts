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

// --------------------------------------------------------------------------
// Card difficulty options
// --------------------------------------------------------------------------
export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'DỄ' },
  { value: 'medium', label: 'VỮA' },
  { value: 'hard', label: 'KHÓ' },
];

// --------------------------------------------------------------------------
// Word types for card classification
// --------------------------------------------------------------------------
export const WORD_TYPES = [
  {
    value: 'noun',
    label: 'Danh từ',
    active: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  {
    value: 'verb',
    label: 'Động từ',
    active: 'border-purple-200 bg-purple-50 text-purple-700',
  },
  {
    value: 'adj',
    label: 'Tính từ',
    active: 'border-orange-200 bg-orange-50 text-orange-700',
  },
  {
    value: 'adv',
    label: 'Trạng từ',
    active: 'border-pink-200 bg-pink-50 text-pink-700',
  },
  {
    value: 'other',
    label: 'Khác',
    active: 'border-slate-200 bg-slate-100 text-slate-600',
  },
];

// --------------------------------------------------------------------------
// FSRS rating labels — used in RatingButtons & SessionComplete
// --------------------------------------------------------------------------
export type TRating = 1 | 2 | 3 | 4;

export const RATINGS: {
  label: string;
  value: TRating;
  interval: string;
  className: string;
}[] = [
  {
    label: 'Lại',
    value: 1,
    interval: 'Học lại',
    className: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
  },
  {
    label: 'Khó',
    value: 2,
    interval: '~1 ngày',
    className:
      'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100',
  },
  {
    label: 'Tốt',
    value: 3,
    interval: '~4 ngày',
    className:
      'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100',
  },
  {
    label: 'Dễ',
    value: 4,
    interval: '~7 ngày',
    className:
      'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100',
  },
];

// Simplified rating labels (label + badge className only) — for SessionComplete summary
export const RATING_LABELS: Record<
  TRating,
  { label: string; className: string }
> = {
  1: { label: 'Lại', className: 'bg-red-50 text-red-600' },
  2: { label: 'Khó', className: 'bg-amber-50 text-amber-600' },
  3: { label: 'Tốt', className: 'bg-blue-50 text-blue-600' },
  4: { label: 'Dễ', className: 'bg-emerald-50 text-emerald-600' },
};
