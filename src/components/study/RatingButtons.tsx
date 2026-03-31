'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { RATINGS } from '@/constants';
import { cn } from '@/lib/utils';

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
