import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LANGUAGE_LABELS } from '@/constants';
import { generatePath, ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  formatDurationString,
  formatStartedAt,
  getMasteryColor,
} from '@/utils';

import type { StudySessionRow } from '@/lib/data/history';

type Props = {
  sessions: StudySessionRow[];
  total: number;
  page: number;
  limit: number;
};

function SessionLabelBadge({
  accuracy,
  mode,
}: {
  accuracy: number;
  mode: 'due' | 'review';
}) {
  if (mode === 'review') {
    return (
      <span className="ml-1.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
        Ôn tập
      </span>
    );
  }
  if (accuracy < 70) {
    return (
      <span className="ml-1.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-500">
        Chưa thuộc
      </span>
    );
  }
  return (
    <span className="ml-1.5 rounded-full bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-600">
      Mới
    </span>
  );
}

export function HistoryTable({ sessions, total, page, limit }: Props) {
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-slate-400">
          Chưa có phiên học nào trong khoảng thời gian này.
        </p>
        <Button
          asChild
          size="sm"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Link href={ROUTES.STUDY}>Bắt đầu học</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100">
              <TableHead className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Bộ thẻ
              </TableHead>
              <TableHead className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Thời gian
              </TableHead>
              <TableHead className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Thời lượng
              </TableHead>
              <TableHead className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Thẻ đã ôn
              </TableHead>
              <TableHead className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Độ chính xác
              </TableHead>
              <TableHead className="text-right text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => {
              const lang =
                LANGUAGE_LABELS[s.deck_language] ?? LANGUAGE_LABELS.en;
              const accuracy =
                s.cards_reviewed > 0
                  ? Math.round((s.correct_count / s.cards_reviewed) * 100)
                  : 0;
              const time = formatStartedAt(s.started_at);
              return (
                <TableRow key={s.id} className="border-slate-100">
                  {/* Deck */}
                  <TableCell className="py-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black',
                          lang.className,
                        )}
                      >
                        {s.deck_language === 'zh' ? '文' : 'A'}
                      </span>
                      <div>
                        <p className="leading-tight font-bold text-slate-800">
                          {s.deck_name}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                          {s.deck_description || 'Không có mô tả.'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  {/* Time */}
                  <TableCell className="py-4">
                    <p className="text-sm font-semibold text-slate-700">
                      {time.line1}
                    </p>
                    <p className="text-xs text-slate-400">{time.line2}</p>
                  </TableCell>
                  {/* Duration */}
                  <TableCell className="py-4 text-sm font-semibold text-slate-700">
                    {formatDurationString(s.duration_sec)}
                  </TableCell>
                  {/* Cards reviewed */}
                  <TableCell className="py-4">
                    <span className="text-sm font-semibold text-slate-700">
                      {s.cards_reviewed}/{s.cards_total}
                    </span>
                    <SessionLabelBadge accuracy={accuracy} mode={s.mode} />
                  </TableCell>
                  {/* Accuracy */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            getMasteryColor(accuracy),
                          )}
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-sm font-bold',
                          accuracy >= 80
                            ? 'text-emerald-600'
                            : accuracy >= 50
                              ? 'text-amber-500'
                              : 'text-red-500',
                        )}
                      >
                        {accuracy}%
                      </span>
                    </div>
                  </TableCell>
                  {/* Action */}
                  <TableCell className="py-4 text-right">
                    <Button
                      asChild
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-700!"
                    >
                      <Link
                        href={generatePath(ROUTES.STUDY_SESSION, {
                          deckId: s.deck_id,
                        })}
                      >
                        Học lại
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {sessions.map((s) => {
          const lang = LANGUAGE_LABELS[s.deck_language] ?? LANGUAGE_LABELS.en;
          const accuracy =
            s.cards_reviewed > 0
              ? Math.round((s.correct_count / s.cards_reviewed) * 100)
              : 0;
          const time = formatStartedAt(s.started_at);
          return (
            <div key={s.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black',
                      lang.className,
                    )}
                  >
                    {s.deck_language === 'zh' ? '文' : 'A'}
                  </span>
                  <div>
                    <p className="leading-tight font-bold text-slate-800">
                      {s.deck_name}
                    </p>
                    <p className="text-xs text-slate-400">{time.line1}</p>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Link
                    href={generatePath(ROUTES.STUDY_SESSION, {
                      deckId: s.deck_id,
                    })}
                  >
                    H\u1ecdc l\u1ea1i
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {formatDurationString(s.duration_sec)} •{' '}
                  <span className="font-semibold text-slate-700">
                    {s.cards_reviewed}/{s.cards_total}
                  </span>
                  <SessionLabelBadge accuracy={accuracy} mode={s.mode} />
                </span>
                <span
                  className={cn(
                    'font-bold',
                    accuracy >= 80
                      ? 'text-emerald-600'
                      : accuracy >= 50
                        ? 'text-amber-500'
                        : 'text-red-500',
                  )}
                >
                  {accuracy}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    getMasteryColor(accuracy),
                  )}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Hiển thị {start}–{end} trong tổng số {total} phiên học
          </span>
          <div className="flex gap-1">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={generatePath(
                    ROUTES.STUDY_HISTORY,
                    {},
                    { page: page - 1 },
                  )}
                  className="px-3"
                >
                  ‹
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={generatePath(
                    ROUTES.STUDY_HISTORY,
                    {},
                    { page: page + 1 },
                  )}
                  className="px-3"
                >
                  ›
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
      {totalPages <= 1 && total > 0 && (
        <p className="mt-4 text-sm text-slate-400">
          Hiển thị {total} trong tổng số {total} phiên học
        </p>
      )}
    </div>
  );
}
