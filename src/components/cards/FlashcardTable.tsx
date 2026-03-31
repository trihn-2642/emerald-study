'use client';

import dayjs from 'dayjs';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { MasteryBadge } from '@/components/cards/MasteryBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteCard } from '@/lib/data/cards';

import type { Example, Flashcard, FsrsData } from '@/types';

function getDueLabel(nextReview: string): { label: string; className: string } {
  const now = dayjs();
  const due = dayjs(nextReview);
  const diffDays = due.startOf('day').diff(now.startOf('day'), 'day');

  if (diffDays < 0)
    return { label: 'Quá hạn', className: 'bg-red-100 text-red-600' };
  if (diffDays === 0)
    return { label: 'Hôm nay', className: 'bg-orange-100 text-orange-600' };
  if (diffDays === 1)
    return { label: 'Ngày mai', className: 'bg-amber-100 text-amber-600' };
  return {
    label: `${diffDays} ngày`,
    className: 'bg-slate-100 text-slate-500',
  };
}

function getLastReviewLabel(lastReview: string | null): string {
  if (!lastReview) return 'Chưa ôn';
  const now = dayjs();
  const reviewed = dayjs(lastReview);
  const diffDays = now.startOf('day').diff(reviewed.startOf('day'), 'day');
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 30) return `${diffDays} ngày trước`;
  const diffMonths = now.diff(reviewed, 'month');
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  return `${now.diff(reviewed, 'year')} năm trước`;
}

type StateFilter = 'all' | '0' | '1' | '2' | '3';

const WORD_TYPE_MAP: Record<string, { label: string; className: string }> = {
  noun: { label: 'Danh từ', className: 'bg-blue-50 text-blue-700' },
  verb: { label: 'Động từ', className: 'bg-purple-50 text-purple-700' },
  adj: { label: 'Tính từ', className: 'bg-orange-50 text-orange-700' },
  adv: { label: 'Trạng từ', className: 'bg-pink-50 text-pink-700' },
  other: { label: 'Khác', className: 'bg-slate-100 text-slate-600' },
};

function WordTypeBadge({ wordType }: { wordType?: string | null }) {
  if (!wordType) return <span className="text-xs text-slate-300">—</span>;
  const config = WORD_TYPE_MAP[wordType];
  if (!config) return <span className="text-xs text-slate-300">—</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function ExampleCell({
  examples,
  isZh,
}: {
  examples: Example[];
  isZh: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  if (examples.length === 0)
    return <span className="text-xs text-slate-300">—</span>;

  const visible = expanded ? examples : examples.slice(0, 1);

  return (
    <div className="max-w-64 space-y-2">
      {visible.map((ex, i) => (
        <div key={i} className="space-y-0.5">
          {isZh ? (
            <>
              {ex.cn && (
                <p className="font-cn text-on-surface text-sm font-medium">
                  {ex.cn}
                </p>
              )}
              {ex.py && (
                <p className="text-xs text-emerald-600 italic">{ex.py}</p>
              )}
              {ex.vn && <p className="text-xs text-slate-500">{ex.vn}</p>}
              {ex.en && (
                <p className="text-xs text-slate-400 italic">{ex.en}</p>
              )}
            </>
          ) : (
            <>
              {ex.en && (
                <p className="text-on-surface text-sm font-medium">{ex.en}</p>
              )}
              {ex.vn && <p className="text-xs text-slate-500">{ex.vn}</p>}
              {ex.cn && (
                <p className="font-cn text-xs text-slate-400 italic">{ex.cn}</p>
              )}
            </>
          )}
        </div>
      ))}
      {examples.length > 1 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex cursor-pointer items-center gap-0.5 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Ẩn bớt
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> +{examples.length - 1} ví dụ
            </>
          )}
        </button>
      )}
    </div>
  );
}

const STATE_FILTERS: { value: StateFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: '2', label: 'Đã thuộc' },
  { value: '1', label: 'Đang học' },
  { value: '0', label: 'Mới' },
  { value: '3', label: 'Học lại' },
];

const PAGE_SIZE = 10;

type Props = {
  flashcards: Flashcard[];
  deckId: string;
  language: 'zh' | 'en';
};

function FlashcardTable({ flashcards, deckId, language }: Props) {
  const isZh = language === 'zh';
  const router = useRouter();
  const [isPending, startDeleteTransition] = useTransition();

  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return flashcards.filter((c) => {
      const matchQuery =
        !q ||
        c.front.toLowerCase().includes(q) ||
        c.pinyin.toLowerCase().includes(q) ||
        c.meaning_vn.toLowerCase().includes(q);
      const state = (c.fsrs_data as FsrsData)?.state ?? 0;
      const matchState = stateFilter === 'all' || state === Number(stateFilter);
      return matchQuery && matchState;
    });
  }, [flashcards, query, stateFilter]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(a.next_review).getTime() - new Date(b.next_review).getTime(),
      ),
    [filtered],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(value: StateFilter) {
    setStateFilter(value);
    setPage(1);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleDelete(cardId: string) {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteCard(cardId, deckId);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      setDeleteTarget(null);
      toast.success('🗑️ Đã xóa thẻ.');
      router.refresh();
    });
  }

  const start = sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, sorted.length);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Table header */}
      <div className="flex flex-col gap-3 border-b border-slate-100/70 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
        <h3 className="text-on-surface font-bold">Danh sách từ vựng</h3>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Tìm kiếm..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-xs transition outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 md:w-48"
            />
          </div>
          {/* State filter */}
          <div className="relative shrink-0">
            <Filter className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              value={stateFilter}
              onChange={(e) =>
                handleFilterChange(e.target.value as StateFilter)
              }
              className="bg-surface-page h-9 cursor-pointer appearance-none rounded-xl border-none py-0 pr-8 pl-9 text-xs font-semibold outline-none focus:ring-0"
            >
              {STATE_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {sorted.length === 0 ? (
        <div className="text-on-muted flex min-h-64 items-center justify-center px-8 py-12 text-sm">
          {flashcards.length === 0
            ? 'Bộ thẻ này chưa có thẻ nào. Hãy thêm thẻ đầu tiên!'
            : 'Không tìm thấy thẻ nào phù hợp.'}
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="divide-y divide-slate-50 md:hidden">
            {paginated.map((card) => {
              const state = (card.fsrs_data as FsrsData)?.state ?? 0;
              const examples = (card.examples ?? []) as Example[];
              const { label: dueLabel, className: dueClass } = getDueLabel(
                card.next_review,
              );
              return (
                <div key={card.id} className="px-5 py-4">
                  {/* Word + due badge */}
                  <div className="mb-1.5 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className={
                          isZh
                            ? 'text-on-surface text-2xl leading-tight font-bold'
                            : 'text-on-surface text-lg font-bold'
                        }
                      >
                        {card.front}
                      </p>
                      {isZh && card.pinyin && (
                        <p className="text-sm font-medium text-emerald-600 italic">
                          {card.pinyin}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${dueClass}`}
                    >
                      {dueLabel}
                    </span>
                  </div>

                  {/* Meanings */}
                  <p className="mb-1 text-sm text-slate-700">
                    {card.meaning_vn}
                  </p>
                  {isZh
                    ? card.meaning_en && (
                        <p className="mb-2 text-xs text-slate-400 italic">
                          {card.meaning_en}
                        </p>
                      )
                    : card.pinyin && (
                        <p className="mb-2 text-xs text-slate-400 italic">
                          {card.pinyin}
                        </p>
                      )}

                  {/* Examples (collapsed by default via ExampleCell) */}
                  {examples.length > 0 && (
                    <div className="mb-3">
                      <ExampleCell examples={examples} isZh={isZh} />
                    </div>
                  )}

                  {/* Footer: state badge + word type + actions */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <MasteryBadge state={state} />
                      <WordTypeBadge wordType={card.word_type} />
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/library/${deckId}/cards/${card.id}/edit`}
                        className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteTarget(card.id);
                          setDeleteError(null);
                        }}
                        className="cursor-pointer rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-7xl border-collapse text-left">
              <thead>
                <tr className="bg-surface-page/40">
                  <th className="px-8 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    {isZh ? 'Chữ Hán' : 'Từ vựng'}
                  </th>
                  {isZh && (
                    <th className="px-8 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Phiên âm
                    </th>
                  )}
                  <th className="px-8 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Tiếng Việt
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    {isZh ? 'Tiếng Anh' : 'Tiếng Trung'}
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Ví dụ
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Loại từ
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Ôn tiếp
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Lần cuối
                  </th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((card) => {
                  const state = (card.fsrs_data as FsrsData)?.state ?? 0;
                  const examples = (card.examples ?? []) as Example[];

                  return (
                    <tr
                      key={card.id}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-8 py-5 align-top">
                        <span
                          className={
                            isZh
                              ? 'text-on-surface text-xl font-bold'
                              : 'text-on-surface text-sm font-semibold'
                          }
                        >
                          {card.front}
                        </span>
                      </td>
                      {isZh && (
                        <td className="px-8 py-5 align-top">
                          <span className="text-sm font-medium text-slate-600">
                            {card.pinyin || (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </span>
                        </td>
                      )}
                      <td className="px-8 py-5 align-top">
                        <span className="text-on-surface line-clamp-3 text-sm">
                          {card.meaning_vn}
                        </span>
                      </td>
                      <td className="px-8 py-5 align-top">
                        {isZh ? (
                          card.meaning_en ? (
                            <span className="text-on-muted line-clamp-3 text-sm">
                              {card.meaning_en}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )
                        ) : card.pinyin ? (
                          <span className="text-on-muted line-clamp-3 text-sm italic">
                            {card.pinyin}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-8 py-5 align-top">
                        <ExampleCell examples={examples} isZh={isZh} />
                      </td>
                      <td className="px-8 py-5 align-top">
                        <WordTypeBadge wordType={card.word_type} />
                      </td>
                      <td className="px-8 py-5 align-top">
                        <MasteryBadge state={state} />
                      </td>
                      <td className="px-8 py-5 align-top">
                        {(() => {
                          const { label, className } = getDueLabel(
                            card.next_review,
                          );
                          return (
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-tighter uppercase ${className}`}
                            >
                              {label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-8 py-5 align-top">
                        <span className="text-xs text-slate-500">
                          {getLastReviewLabel(
                            (card.fsrs_data as FsrsData)?.last_review ?? null,
                          )}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right align-top">
                        <div className="flex items-center justify-end gap-1 transition-opacity">
                          <Link
                            href={`/library/${deckId}/cards/${card.id}/edit`}
                            className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setDeleteTarget(card.id);
                              setDeleteError(null);
                            }}
                            className="cursor-pointer rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-slate-50/50 px-5 py-5 md:px-8 md:py-6">
            <p className="text-xs text-slate-500">
              Hiển thị {start}–{end} của {sorted.length} thẻ
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={
                      page === p
                        ? 'h-8 w-8 cursor-pointer rounded-lg bg-emerald-600 text-xs font-bold text-white'
                        : 'h-8 w-8 cursor-pointer rounded-lg text-xs font-bold transition-colors hover:bg-slate-200'
                    }
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa thẻ</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <p className="text-on-muted text-sm">
              Bạn có chắc muốn xóa thẻ này không? Hành động này{' '}
              <span className="text-on-surface font-semibold">
                không thể hoàn tác
              </span>
              .
            </p>
            {deleteError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {deleteError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteTarget && handleDelete(deleteTarget)}
                disabled={isPending}
              >
                {isPending ? 'Đang xóa...' : 'Xóa thẻ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { FlashcardTable };
