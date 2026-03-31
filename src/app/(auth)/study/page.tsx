import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LANGUAGE_LABELS } from '@/constants';
import { getDueDecks } from '@/lib/data/dashboard';
import { getUser } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';

export default async function StudyListPage() {
  const user = await getUser();
  const allDecks = await getDueDecks(user.id);

  const dueDecks = allDecks.filter((d) => d.due_count > 0);
  const doneDecks = allDecks.filter(
    (d) => d.due_count === 0 && d.card_count > 0,
  );

  const totalDue = dueDecks.reduce((sum, d) => sum + d.due_count, 0);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-emerald-600" />
            <h1 className="text-on-surface text-3xl font-black tracking-tight">
              Phiên học hôm nay
            </h1>
          </div>
          <Link
            href="/study/history"
            className="text-sm font-semibold text-emerald-600 hover:underline"
          >
            Lịch sử →
          </Link>
        </div>
        <p className="text-sm text-slate-400">
          {totalDue > 0
            ? `Bạn có ${totalDue} thẻ cần ôn trong ${dueDecks.length} bộ thẻ.`
            : 'Tuyệt vời! Bạn đã hoàn thành tất cả phiên học hôm nay 🎉'}
        </p>
      </div>

      {/* Due decks */}
      {dueDecks.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-bold tracking-widest text-emerald-600 uppercase">
            Cần ôn hôm nay
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dueDecks.map((deck) => (
              <StudyDeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        </section>
      )}

      {/* Done / review-all decks */}
      {doneDecks.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Đã hoàn thành — ôn lại nếu muốn
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {doneDecks.map((deck) => (
              <StudyDeckCard key={deck.id} deck={deck} done />
            ))}
          </div>
        </section>
      )}

      {allDecks.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-slate-400">Chưa có bộ thẻ nào.</p>
          <Button asChild size="sm" className="bg-emerald-600 text-white">
            <Link href="/library">Tạo bộ thẻ đầu tiên</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

type CardProps = {
  deck: {
    id: string;
    name: string;
    description: string;
    language: 'zh' | 'en';
    card_count: number;
    due_count: number;
    mastery_percent: number;
  };
  done?: boolean;
};

function StudyDeckCard({ deck, done = false }: CardProps) {
  const lang = LANGUAGE_LABELS[deck.language] ?? LANGUAGE_LABELS.en;
  const studyHref = done
    ? `/study/${deck.id}?mode=review`
    : `/study/${deck.id}`;

  return (
    <div
      className={cn(
        'group flex flex-col rounded-2xl bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        !done
          ? 'border-b-4 border-transparent hover:border-emerald-500'
          : 'border-b-4 border-transparent hover:border-slate-200',
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <Badge
          variant="outline"
          className={cn('text-[10px] font-black uppercase', lang.className)}
        >
          {lang.label}
        </Badge>
        {!done && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-black text-red-500">
            {deck.due_count} đến hạn
          </span>
        )}
        {done && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
            ✓ Xong
          </span>
        )}
      </div>

      <h3 className="text-on-surface mb-1 line-clamp-1 font-bold">
        {deck.name}
      </h3>
      <p className="mb-4 line-clamp-2 flex-1 text-xs text-slate-400">
        {deck.description || 'Không có mô tả.'}
      </p>

      {/* Mastery progress bar */}
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            deck.mastery_percent >= 80
              ? 'bg-emerald-500'
              : deck.mastery_percent >= 50
                ? 'bg-amber-400'
                : 'bg-red-400',
          )}
          style={{ width: `${deck.mastery_percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {deck.mastery_percent}% đã thuộc
        </span>
        <Link
          href={studyHref}
          className={cn(
            'rounded-lg px-4 py-1.5 text-xs font-bold transition-colors',
            done
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-emerald-500 text-white hover:bg-emerald-600',
          )}
        >
          {done ? 'Ôn lại' : 'Học ngay'}
        </Link>
      </div>
    </div>
  );
}
