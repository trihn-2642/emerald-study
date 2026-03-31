'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { LANGUAGE_LABELS } from '@/constants';
import { cn } from '@/lib/utils';
import { formatLastStudied } from '@/utils';

import type { DeckStat } from '@/lib/data/statistics';

const PAGE_SIZE = 6;

type Props = {
  decks: DeckStat[];
};

function AccuracyBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-slate-300">—</span>;
  const color =
    value >= 80
      ? 'text-emerald-600'
      : value >= 50
        ? 'text-amber-600'
        : 'text-red-500';
  return <span className={cn('text-sm font-bold', color)}>{value}%</span>;
}

function MasteryBar({ value }: { value: number }) {
  const color =
    value >= 80
      ? 'bg-emerald-500'
      : value >= 50
        ? 'bg-amber-400'
        : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-500">{value}%</span>
    </div>
  );
}

export function DeckStatsTable({ decks }: Props) {
  const [page, setPage] = useState(1);

  if (decks.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-400">Chưa có bộ thẻ nào.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(decks.length / PAGE_SIZE);
  const paged = decks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const paginationBar = totalPages > 1 && (
    <div className="flex items-center justify-between px-8 py-5">
      <p className="text-xs text-slate-500">
        Hiển thị {(page - 1) * PAGE_SIZE + 1}–
        {Math.min(page * PAGE_SIZE, decks.length)} trong {decks.length} bộ thẻ
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={cn(
              'h-8 w-8 cursor-pointer rounded-lg text-xs font-bold transition-colors',
              p === page ? 'bg-emerald-600 text-white' : 'hover:bg-slate-200',
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  'Bộ thẻ',
                  'Số thẻ',
                  'Đã thuộc',
                  'Phiên học',
                  'Độ chính xác',
                  'Học lần cuối',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map((deck) => {
                const lang =
                  LANGUAGE_LABELS[deck.language] ?? LANGUAGE_LABELS.en;
                return (
                  <tr
                    key={deck.id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-black text-emerald-600">
                          {deck.name.charAt(0)}
                        </div>
                        <div>
                          <p className="max-w-55 truncate text-sm font-semibold text-slate-700">
                            {deck.name}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              'mt-0.5 text-[9px] font-black uppercase',
                              lang.className,
                            )}
                          >
                            {lang.label}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {deck.card_count}
                    </td>
                    <td className="px-5 py-4">
                      <MasteryBar value={deck.mastery_percent} />
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {deck.session_count > 0 ? (
                        <span>
                          <span className="font-semibold text-slate-700">
                            {deck.session_count}
                          </span>{' '}
                          phiên
                        </span>
                      ) : (
                        <span className="text-slate-300">Chưa học</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <AccuracyBadge value={deck.avg_accuracy} />
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {formatLastStudied(deck.last_studied_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="border-t border-slate-100 bg-slate-50/50">
            {paginationBar}
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {paged.map((deck) => {
          const lang = LANGUAGE_LABELS[deck.language] ?? LANGUAGE_LABELS.en;
          return (
            <div key={deck.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-black text-emerald-600">
                    {deck.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {deck.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'mt-0.5 text-[9px] font-black uppercase',
                        lang.className,
                      )}
                    >
                      {lang.label}
                    </Badge>
                  </div>
                </div>
                <Link
                  href={`/study/${deck.id}`}
                  className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-100"
                >
                  Học
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Số thẻ</p>
                  <p className="text-sm font-bold text-slate-700">
                    {deck.card_count}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">
                    Đã thuộc
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {deck.mastery_percent}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">
                    Chính xác
                  </p>
                  <AccuracyBadge value={deck.avg_accuracy} />
                </div>
              </div>
            </div>
          );
        })}
        {totalPages > 1 && (
          <div className="rounded-2xl bg-white shadow-sm">{paginationBar}</div>
        )}
      </div>
    </>
  );
}
