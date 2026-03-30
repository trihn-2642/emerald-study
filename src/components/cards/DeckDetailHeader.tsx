import { BookOpen, CalendarDays, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { AnimatedProgress } from '@/components/ui/animated-progress';
import { Button } from '@/components/ui/button';
import { CountUp } from '@/components/ui/count-up';

import type { DeckDetail } from '@/lib/data/library';

type Props = {
  deck: DeckDetail;
};

function DeckDetailHeader({ deck }: Props) {
  const {
    id,
    name,
    description,
    card_count,
    due_count,
    mastery_percent,
    mastered_count,
    learning_count,
    new_count,
    created_at,
  } = deck;

  const mastery = mastery_percent ?? 0;

  const updatedDate = new Date(created_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="mb-10">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link
          href="/library"
          className="transition-colors hover:text-emerald-600"
        >
          Thư viện
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-on-surface font-semibold">{name}</span>
      </nav>

      {/* Page Header */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            <h1 className="text-on-surface text-3xl font-black tracking-tight">
              Chi tiết bộ thẻ: {name}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="bg-surface-input rounded-full px-3 py-1 text-[11px] font-bold tracking-widest text-emerald-700 uppercase">
              {card_count} THẺ
            </span>
            <div className="flex items-center gap-1.5 text-slate-500">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs">Cập nhật lần cuối: {updatedDate}</span>
            </div>
          </div>
          {description && (
            <p className="text-on-muted mt-2 text-sm">{description}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {due_count > 0 ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Link href={`/study/${id}`}>
                Học ngay ({due_count} thẻ cần ôn)
              </Link>
            </Button>
          ) : (
            card_count > 0 && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Link href={`/study/${id}?mode=review`}>Ôn lại bộ này</Link>
              </Button>
            )
          )}
          <Button
            asChild
            size="sm"
            className="gap-2 bg-emerald-600 font-bold shadow-lg shadow-emerald-900/10 hover:bg-emerald-50! hover:text-emerald-700"
          >
            <Link href={`/library/${id}/cards/new`}>+ Thêm thẻ mới</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Đã thuộc
          </p>
          <p className="text-2xl font-black text-emerald-600">
            <CountUp to={mastered_count} />
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Đang học
          </p>
          <p className="text-2xl font-black text-orange-500">
            <CountUp to={learning_count} />
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Mới
          </p>
          <p className="text-2xl font-black text-blue-500">
            <CountUp to={new_count} />
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Tỉ lệ hoàn thành
          </p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-on-surface text-2xl font-black">
              <CountUp to={mastery} suffix="%" />
            </p>
            <span className="mb-0.5 text-xs font-semibold text-slate-400">
              {mastered_count}/{card_count}
            </span>
          </div>
          <AnimatedProgress
            value={mastery}
            className="mt-3 h-2 bg-emerald-100"
            indicatorClassName="rounded-full bg-emerald-500"
          />
        </div>
      </div>

      {/* Study CTA */}
    </div>
  );
}

export { DeckDetailHeader };
