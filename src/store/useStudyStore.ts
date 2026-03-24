import { create } from "zustand";
import type { Flashcard } from "@/types";

interface StudyState {
  sessionCards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  /** rating (1–4) → how many times it was chosen this session */
  ratingStats: Record<number, number>;
}

interface StudyActions {
  setSession: (cards: Flashcard[]) => void;
  flipCard: () => void;
  nextCard: () => void;
  /**
   * Rate the current card.
   * Again (1) → push card to end of queue (re-queue).
   * Hard/Good/Easy (2/3/4) → advance to next card.
   */
  rateCard: (rating: 1 | 2 | 3 | 4) => void;
  reset: () => void;
}

const initialState: StudyState = {
  sessionCards: [],
  currentIndex: 0,
  isFlipped: false,
  ratingStats: {},
};

export const useStudyStore = create<StudyState & StudyActions>((set, get) => ({
  ...initialState,

  setSession: (cards) =>
    set({
      sessionCards: [...cards],
      currentIndex: 0,
      isFlipped: false,
      ratingStats: {},
    }),

  flipCard: () => set({ isFlipped: true }),

  nextCard: () =>
    set((s) => ({ currentIndex: s.currentIndex + 1, isFlipped: false })),

  rateCard: (rating) => {
    const { sessionCards, currentIndex, ratingStats } = get();
    const card = sessionCards[currentIndex];
    if (!card) return;

    const newStats = {
      ...ratingStats,
      [rating]: (ratingStats[rating] ?? 0) + 1,
    };

    if (rating === 1) {
      // Re-queue: push current card to the end of the remaining queue
      set({
        sessionCards: [...sessionCards, card],
        currentIndex: currentIndex + 1,
        isFlipped: false,
        ratingStats: newStats,
      });
    } else {
      set({
        currentIndex: currentIndex + 1,
        isFlipped: false,
        ratingStats: newStats,
      });
    }
  },

  reset: () => set(initialState),
}));
