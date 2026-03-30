'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/lib/utils';

type RatingConfig = {
  label: string;
  value: 1 | 2 | 3 | 4;
  interval: string;
  className: string;
};

const RATINGS: RatingConfig[] = [
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

type Props = {
  visible: boolean;
  onRate: (rating: 1 | 2 | 3 | 4) => void;
};

export function RatingButtons({ visible, onRate }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="grid w-full max-w-lg grid-cols-4 gap-2"
        >
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => onRate(r.value)}
              className={cn(
                'flex cursor-pointer flex-col items-center rounded-xl px-2 py-3 transition-all',
                r.className,
              )}
            >
              <span className="text-sm font-bold">{r.label}</span>
              <span className="mt-0.5 text-[10px] opacity-70">
                {r.interval}
              </span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
