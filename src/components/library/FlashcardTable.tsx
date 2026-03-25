'use client';

import dayjs from 'dayjs';
import { Pencil, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { MasteryBadge } from '@/components/library/MasteryBadge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { Flashcard, FsrsData } from '@/types';

type SortValue = 'next_review' | 'front' | 'state';

const SORTS: { value: SortValue; label: string }[] = [
  { value: 'next_review', label: 'Ngày ôn' },
  { value: 'front', label: 'Từ A-Z' },
  { value: 'state', label: 'Trạng thái' },
];

function getReviewLabel(nextReview: string): {
  label: string;
  className: string;
} {
  const now = dayjs();
  const review = dayjs(nextReview);
  const diffDays = review.diff(now, 'day');

  if (diffDays < 0)
    return {
      label: 'Quá hạn',
      className: 'text-red-600 font-medium',
    };
  if (diffDays === 0)
    return {
      label: 'Hôm nay',
      className: 'text-orange-600 font-medium',
    };
  if (diffDays === 1)
    return {
      label: 'Ngày mai',
      className: 'text-amber-600',
    };
  return {
    label: `${diffDays} ngày`,
    className: 'text-on-muted',
  };
}

type Props = {
  flashcards: Flashcard[];
  deckId: string;
};

function FlashcardTable({ flashcards, deckId }: Props) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortValue>('next_review');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return flashcards.filter(
      (c) =>
        !q ||
        c.front.toLowerCase().includes(q) ||
        c.pinyin.toLowerCase().includes(q) ||
        c.meaning_vn.toLowerCase().includes(q),
    );
  }, [flashcards, query]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'next_review')
        return (
          new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
        );
      if (sortBy === 'front') return a.front.localeCompare(b.front, 'zh');
      return (
        ((a.fsrs_data as FsrsData)?.state ?? 0) -
        ((b.fsrs_data as FsrsData)?.state ?? 0)
      );
    });
  }, [filtered, sortBy]);

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-50 flex-1">
          <Search className="text-on-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm thẻ..."
            className="pl-9"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortValue)}
          className="border-input bg-background text-on-surface focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <Link
          href={`/library/${deckId}/cards/new`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          + Thêm thẻ
        </Link>
      </div>

      {/* Count */}
      <p className="text-on-muted mb-3 text-xs">
        {sorted.length} / {flashcards.length} thẻ
      </p>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="text-on-muted flex min-h-50 items-center justify-center rounded-2xl bg-white text-sm shadow-sm">
          {flashcards.length === 0
            ? 'Bộ thẻ này chưa có thẻ nào. Hãy thêm thẻ đầu tiên!'
            : 'Không tìm thấy thẻ nào phù hợp.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-sm">
              <thead>
                <tr className="text-on-muted border-b border-slate-100 bg-slate-50/50 text-xs font-medium">
                  <th className="px-4 py-3 text-left">Từ / Cụm từ</th>
                  <th className="px-4 py-3 text-left">Phiên âm</th>
                  <th className="px-4 py-3 text-left">Nghĩa tiếng Việt</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Ôn tiếp</th>
                  <th className="px-4 py-3 text-center">Sửa</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((card, i) => {
                  const state = (card.fsrs_data as FsrsData)?.state ?? 0;
                  const reviewInfo = getReviewLabel(card.next_review);
                  return (
                    <tr
                      key={card.id}
                      className={cn(
                        'border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/50',
                        i % 2 === 0 ? '' : 'bg-slate-50/30',
                      )}
                    >
                      <td className="text-on-surface px-4 py-3 font-medium">
                        {card.front}
                      </td>
                      <td className="text-on-muted px-4 py-3">{card.pinyin}</td>
                      <td className="text-on-surface max-w-50 px-4 py-3">
                        <span className="line-clamp-2">{card.meaning_vn}</span>
                      </td>
                      <td className="px-4 py-3">
                        <MasteryBadge state={state} />
                      </td>
                      <td
                        className={cn(
                          'px-4 py-3 text-xs',
                          reviewInfo.className,
                        )}
                      >
                        {reviewInfo.label}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/library/${deckId}/cards/${card.id}/edit`}
                          className="text-on-muted hover:text-on-surface inline-flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-slate-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export { FlashcardTable };
