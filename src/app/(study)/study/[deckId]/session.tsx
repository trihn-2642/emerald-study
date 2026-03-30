'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { FlashcardView } from '@/components/study/FlashcardView';
import { RatingButtons } from '@/components/study/RatingButtons';
import { SessionComplete } from '@/components/study/SessionComplete';
import { StudyHeader } from '@/components/study/StudyHeader';
import { updateCardAfterRating } from '@/lib/data/study';
import { scheduleCard } from '@/lib/fsrs';
import { useStudyStore } from '@/store/useStudyStore';

import type { Deck, Flashcard } from '@/types';

type Props = {
  initialCards: Flashcard[];
  deck: Deck;
  mode: 'due' | 'review';
};

export function StudySession({ initialCards, deck, mode }: Props) {
  const {
    sessionCards,
    currentIndex,
    isFlipped,
    ratingStats,
    setSession,
    flipCard,
    unflipCard,
    rateCard,
    reset,
  } = useStudyStore();

  // viewingIndex: null = at current card; number = reviewing a past card (read-only)
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  const stateRef = useRef({
    sessionCards,
    currentIndex,
    isFlipped,
    viewingIndex,
  });
  stateRef.current = { sessionCards, currentIndex, isFlipped, viewingIndex };

  const isRatingRef = useRef(false);

  const shuffle = (arr: Flashcard[]) =>
    [...arr].sort(() => Math.random() - 0.5);

  useEffect(() => {
    setSession(shuffle(initialCards));
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset viewingIndex whenever the current card advances
  useEffect(() => {
    setViewingIndex(null);
  }, [currentIndex]);

  const handleRate = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      if (isRatingRef.current) return;
      // Don't allow rating while reviewing history
      if (stateRef.current.viewingIndex !== null) return;
      const { sessionCards: cards, currentIndex: idx } = stateRef.current;
      const card = cards[idx];
      if (!card) return;

      isRatingRef.current = true;

      const { nextData, nextReview } = scheduleCard(card.fsrs_data, rating);
      rateCard(rating);
      updateCardAfterRating(card.id, nextData, nextReview).catch(() => {});

      setTimeout(() => {
        isRatingRef.current = false;
      }, 300);
    },
    [rateCard],
  );

  const handleBack = useCallback(() => {
    const { currentIndex: idx, viewingIndex: vi } = stateRef.current;
    const from = vi !== null ? vi : idx;
    if (from > 0) setViewingIndex(from - 1);
  }, []);

  const handleForward = useCallback(() => {
    const { currentIndex: idx, viewingIndex: vi } = stateRef.current;
    if (vi === null) return;
    const next = vi + 1;
    if (next >= idx) {
      setViewingIndex(null); // return to current card
    } else {
      setViewingIndex(next);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const { isFlipped: flipped, viewingIndex: vi } = stateRef.current;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!flipped) flipCard();
        else unflipCard();
      }
      if (flipped && vi === null) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(3);
        if (e.key === '4') handleRate(4);
      }
      if (e.key === 'ArrowLeft') handleBack();
      if (e.key === 'ArrowRight') handleForward();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flipCard, unflipCard, handleRate, handleBack, handleForward]);

  const handleStudyAgain = () => {
    setViewingIndex(null);
    setSession(shuffle(initialCards));
  };

  const isDone = currentIndex >= sessionCards.length && sessionCards.length > 0;

  const isReviewing = viewingIndex !== null;
  const displayIndex = isReviewing ? viewingIndex : currentIndex;
  const displayCard = sessionCards[displayIndex];
  const completedUniqueCards = Math.min(displayIndex + 1, sessionCards.length);
  const canGoBack = displayIndex > 0;
  const canGoForward = isReviewing;

  if (isDone) {
    return (
      <SessionComplete
        deckName={deck.name}
        deckId={deck.id}
        mode={mode}
        totalCards={initialCards.length}
        ratingStats={ratingStats}
        onStudyAgain={handleStudyAgain}
      />
    );
  }

  if (!displayCard) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StudyHeader
        deckId={deck.id}
        deckName={deck.name}
        current={completedUniqueCards}
        total={sessionCards.length}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        isReviewing={isReviewing}
        onBack={handleBack}
        onForward={handleForward}
      />

      {/* Card area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6">
        <FlashcardView
          card={displayCard}
          isFlipped={isFlipped}
          onFlip={flipCard}
          onUnflip={unflipCard}
        />

        <div className="mt-2 w-full max-w-lg">
          {/* Rating buttons only when on current card */}
          {!isReviewing && (
            <RatingButtons visible={isFlipped} onRate={handleRate} />
          )}

          {/* Hint when reviewing history */}
          {isReviewing && (
            <p className="mt-2 text-center text-xs text-slate-300">
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-400">
                ←
              </kbd>{' '}
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-400">
                →
              </kbd>{' '}
              để xem thẻ khác ·{' '}
              <button
                onClick={() => setViewingIndex(null)}
                className="cursor-pointer font-medium text-emerald-500 hover:underline"
              >
                Quay lại thẻ hiện tại
              </button>
            </p>
          )}

          {!isReviewing && !isFlipped && (
            <p className="mt-4 text-center text-xs text-slate-300">
              Nhấn thẻ hoặc{' '}
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-400">
                Space
              </kbd>{' '}
              để lật ·{' '}
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-400">
                ←
              </kbd>{' '}
              xem lại thẻ trước
            </p>
          )}

          {!isReviewing && isFlipped && (
            <p className="mt-3 text-center text-xs text-slate-300">
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-400">
                1
              </kbd>{' '}
              –{' '}
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-400">
                4
              </kbd>{' '}
              để chấm điểm ·{' '}
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-400">
                ←
              </kbd>{' '}
              xem lại thẻ trước
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
