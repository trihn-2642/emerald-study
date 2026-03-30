'use client';

import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';

import { Button } from '@/components/ui/button';
import { saveStudySession } from '@/lib/data/history';
import { useStudyStore } from '@/store/useStudyStore';

type Props = {
  deckName: string;
  deckId: string;
  mode: 'due' | 'review';
  totalCards: number;
  ratingStats: Record<number, number>;
  onStudyAgain: () => void;
};

const RATING_LABELS: Record<number, { label: string; className: string }> = {
  1: { label: 'Lại', className: 'bg-red-50 text-red-600' },
  2: { label: 'Khó', className: 'bg-amber-50 text-amber-600' },
  3: { label: 'Tốt', className: 'bg-blue-50 text-blue-600' },
  4: { label: 'Dễ', className: 'bg-emerald-50 text-emerald-600' },
};

export function SessionComplete({
  deckName,
  deckId,
  mode,
  totalCards,
  ratingStats,
  onStudyAgain,
}: Props) {
  const sessionStartedAt = useStudyStore((s) => s.sessionStartedAt);
  const hasSaved = useRef(false);

  // Save session exactly once when this screen mounts
  useEffect(() => {
    if (hasSaved.current || !sessionStartedAt) return;
    hasSaved.current = true;

    const endedAt = new Date();
    const again = ratingStats[1] ?? 0;
    const hard = ratingStats[2] ?? 0;
    const good = ratingStats[3] ?? 0;
    const easy = ratingStats[4] ?? 0;
    // cards_reviewed = unique cards finished (Hard+Good+Easy, not re-queued Again)
    const cardsReviewed = hard + good + easy;

    saveStudySession({
      deck_id: deckId,
      started_at: sessionStartedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_sec: Math.round(
        (endedAt.getTime() - sessionStartedAt.getTime()) / 1000,
      ),
      cards_total: totalCards,
      cards_reviewed: cardsReviewed,
      correct_count: good + easy,
      mode,
      rating_breakdown: { again, hard, good, easy },
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [dimensions] = useState(() => {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    return { width: window.innerWidth, height: window.innerHeight };
  });

  const statsEntries = Object.entries(ratingStats)
    .map(([rating, count]) => ({ rating: Number(rating), count }))
    .sort((a, b) => a.rating - b.rating);

  return (
    <div className="bg-surface-page relative flex min-h-screen flex-col items-center justify-center px-4">
      {dimensions.width > 0 && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={300}
          colors={['#10b981', '#059669', '#34d399', '#6ee7b7', '#d1fae5']}
        />
      )}

      <div className="relative z-10 w-full max-w-sm space-y-6 text-center">
        {/* Title */}
        <div>
          <div className="mb-3 text-5xl">🎉</div>
          <h1 className="text-on-surface text-2xl font-black tracking-tight">
            Hoàn thành!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Bạn đã ôn xong <span className="font-bold">{deckName}</span>
          </p>
        </div>

        {/* Stats card */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Kết quả
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
              {totalCards} thẻ
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {statsEntries.map(({ rating, count }) => {
              const info = RATING_LABELS[rating];
              if (!info) return null;
              return (
                <div
                  key={rating}
                  className={`flex flex-col items-center rounded-xl p-2 ${info.className}`}
                >
                  <span className="text-lg font-black">{count}</span>
                  <span className="text-[10px] font-bold">{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={onStudyAgain}
            className="h-auto w-full cursor-pointer gap-2 py-3"
          >
            <RotateCcw className="h-4 w-4" />
            Học lại bộ này
          </Button>
          <Link href="/study">
            <Button className="from-brand-deep h-auto w-full cursor-pointer bg-linear-to-br to-emerald-500 py-3 font-semibold text-white hover:opacity-90">
              Về Phiên học
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
