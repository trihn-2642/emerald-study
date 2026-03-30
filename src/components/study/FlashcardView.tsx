'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { CardBack } from './CardBack';
import { CardFront } from './CardFront';

import type { Flashcard } from '@/types';

type Props = {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onUnflip: () => void;
};

export function FlashcardView({ card, isFlipped, onFlip, onUnflip }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={card.id}
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -80, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="w-full max-w-lg"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="relative"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Front face – click to flip */}
          <div
            className="min-h-95 w-full cursor-pointer rounded-2xl bg-white p-6 shadow-[0_8px_40px_rgba(11,28,48,0.08)] md:p-8"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: isFlipped ? 'none' : 'auto',
            }}
            onClick={onFlip}
          >
            <CardFront card={card} />
          </div>

          {/* Back face – click to flip back */}
          <div
            className="absolute inset-0 min-h-95 w-full cursor-pointer rounded-2xl bg-white p-6 shadow-[0_8px_40px_rgba(11,28,48,0.08)] md:p-8"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              pointerEvents: isFlipped ? 'auto' : 'none',
            }}
            onClick={onUnflip}
          >
            <CardBack card={card} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
