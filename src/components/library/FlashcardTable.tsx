'use client';

import dayjs from 'dayjs';
import { Pencil, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { MasteryBadge } from '@/components/library/MasteryBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    return { label: 'Quá hạn', className: 'text-red-600 font-medium' };
  if (diffDays === 0)
    return { label: 'Hôm nay', className: 'text-orange-600 font-medium' };
  if (diffDays === 1) return { label: 'Ngày mai', className: 'text-amber-600' };
  return { label: `${diffDays} ngày`, className: 'text-on-muted' };
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
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortValue)}>
          <SelectTrigger className="w-36 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href={`/library/${deckId}/cards/new`}>+ Thêm thẻ</Link>
        </Button>
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
            <Table className="min-w-150">
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Từ / Cụm từ</TableHead>
                  <TableHead>Phiên âm</TableHead>
                  <TableHead>Nghĩa tiếng Việt</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ôn tiếp</TableHead>
                  <TableHead className="text-center">Sửa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((card, i) => {
                  const state = (card.fsrs_data as FsrsData)?.state ?? 0;
                  const reviewInfo = getReviewLabel(card.next_review);
                  return (
                    <TableRow
                      key={card.id}
                      className={cn(i % 2 !== 0 ? 'bg-slate-50/30' : '')}
                    >
                      <TableCell className="text-on-surface font-medium">
                        {card.front}
                      </TableCell>
                      <TableCell className="text-on-muted">
                        {card.pinyin}
                      </TableCell>
                      <TableCell className="text-on-surface max-w-50">
                        <span className="line-clamp-2">{card.meaning_vn}</span>
                      </TableCell>
                      <TableCell>
                        <MasteryBadge state={state} />
                      </TableCell>
                      <TableCell
                        className={cn('text-xs', reviewInfo.className)}
                      >
                        {reviewInfo.label}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-on-muted hover:text-on-surface h-8 w-8"
                          asChild
                        >
                          <Link
                            href={`/library/${deckId}/cards/${card.id}/edit`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

export { FlashcardTable };
