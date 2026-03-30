import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Grade,
  Rating,
  State,
} from 'ts-fsrs';

import type { FsrsData } from '@/types';

const f = fsrs(generatorParameters({ enable_fuzz: true }));

/**
 * Compute the next FSRS state for a card after a rating.
 * Returns the updated FsrsData and the next review ISO timestamp.
 */
export function scheduleCard(
  data: FsrsData,
  rating: Grade,
): { nextData: FsrsData; nextReview: string } {
  // For new (never-reviewed) cards, the FSRS algorithm requires stability=0 and difficulty=0.
  // Our DB may store a non-zero difficulty from DIFFICULTY_MAP before the first review,
  // which ts-fsrs rejects as an invalid memory state. Use createEmptyCard() instead.
  const isNew = data.state === 0 || data.reps === 0;

  const card = isNew
    ? createEmptyCard()
    : {
        due: data.last_review ? new Date(data.last_review) : new Date(),
        stability: data.stability,
        difficulty: data.difficulty,
        elapsed_days: data.elapsed_days,
        scheduled_days: data.scheduled_days,
        learning_steps: 0,
        reps: data.reps,
        lapses: data.lapses,
        state: data.state as State,
        last_review: data.last_review ? new Date(data.last_review) : undefined,
      };

  const result = f.next(card, new Date(), rating);
  const next = result.card;

  return {
    nextData: {
      stability: next.stability,
      difficulty: next.difficulty,
      elapsed_days: next.elapsed_days,
      scheduled_days: next.scheduled_days,
      reps: next.reps,
      lapses: next.lapses,
      state: next.state as number,
      last_review: next.last_review ? next.last_review.toISOString() : null,
    },
    nextReview: next.due.toISOString(),
  };
}

export { Rating };
