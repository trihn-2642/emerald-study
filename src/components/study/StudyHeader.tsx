'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

import { generatePath, ROUTES } from '@/lib/routes';

type Props = {
  deckId: string;
  deckName: string;
  current: number;
  total: number;
  canGoBack: boolean;
  canGoForward: boolean;
  isReviewing: boolean;
  onBack: () => void;
  onForward: () => void;
};

export function StudyHeader({
  deckId,
  deckName,
  current,
  total,
  canGoBack,
  canGoForward,
  isReviewing,
  onBack,
  onForward,
}: Props) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div>
      {/* Progress bar */}
      <div className="h-1 w-full bg-slate-100">
        <div
          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <Link
          href={generatePath(ROUTES.DECK_CARDS, { deckId })}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <X className="h-5 w-5" />
        </Link>

        <div className="flex flex-col items-center">
          <span className="text-on-surface text-sm font-bold">{deckName}</span>
          <div className="flex items-center gap-2">
            {isReviewing && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                Xem lại
              </span>
            )}
            <span className="text-[11px] text-slate-400">
              {current} / {total} thẻ
            </span>
          </div>
        </div>

        {/* Back / Forward navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onForward}
            disabled={!canGoForward}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
