import { Award, BookOpen, Layers, Sparkles, Target, Zap } from 'lucide-react';
import Link from 'next/link';

import { CountUp } from '@/components/ui/count-up';
import { getAllDecks } from '@/lib/data/library';
import { generatePath, ROUTES } from '@/lib/routes';

type Props = {
  userId: string;
};

export async function LibraryStatsSection({ userId }: Props) {
  const decks = await getAllDecks(userId);

  const totalCards = decks.reduce((sum, d) => sum + (d.card_count ?? 0), 0);
  const totalDue = decks.reduce((sum, d) => sum + (d.due_count ?? 0), 0);
  const masteredTotal = decks.reduce(
    (sum, d) =>
      sum + Math.round(((d.mastery_percent ?? 0) / 100) * (d.card_count ?? 0)),
    0,
  );
  const masteredPct =
    totalCards > 0 ? Math.round((masteredTotal / totalCards) * 100) : 0;
  const zhDecks = decks.filter((d) => d.language === 'zh').length;
  const enDecks = decks.filter((d) => d.language === 'en').length;

  const topDueDeck = decks
    .filter((d) => (d.due_count ?? 0) > 0)
    .sort((a, b) => (b.due_count ?? 0) - (a.due_count ?? 0))[0];

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* CTA card */}
      <div className="from-brand-deep relative overflow-hidden rounded-2xl bg-linear-to-br to-emerald-600 p-6 text-white">
        <Sparkles className="absolute top-4 right-4 h-8 w-8 text-white/20" />
        <Sparkles className="absolute right-16 bottom-6 h-5 w-5 text-white/15" />
        <Sparkles className="absolute right-8 bottom-4 h-4 w-4 text-white/10" />
        <div className="relative">
          <span className="mb-3 inline-flex items-center rounded-full bg-yellow-400/90 px-2.5 py-0.5 text-xs font-bold tracking-wide text-yellow-900 uppercase">
            Mục tiêu hôm nay
          </span>
          <p className="mb-1 text-2xl leading-snug font-bold">
            {totalDue > 0
              ? `Chinh phục ${totalDue} thẻ hôm nay`
              : 'Hoàn thành mục tiêu hôm nay!'}
          </p>
          <p className="mb-5 text-sm text-emerald-100">
            {totalDue > 0
              ? 'Ôn tập đều đặn giúp bạn ghi nhớ lâu hơn.'
              : 'Tuyệt vời! Hãy tiếp tục duy trì streak của bạn.'}
          </p>
          {totalDue > 0 ? (
            <Link
              href={generatePath(ROUTES.STUDY_SESSION, {
                deckId: topDueDeck?.id ?? '',
              })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 transition-opacity hover:opacity-90"
            >
              Bắt đầu học ngay
            </Link>
          ) : (
            <Link
              href={generatePath(ROUTES.DECK_CARDS_NEW, {
                deckId: decks[0]?.id ?? '',
              })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-white/30"
            >
              Thêm thẻ mới
            </Link>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-600" />
          <span className="text-on-surface text-sm font-bold">
            Thống kê nhanh
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Thẻ đã thuộc */}
          <div className="rounded-xl bg-blue-50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs text-blue-600">Đã thuộc</span>
            </div>
            <p className="text-on-surface text-xl font-bold">
              <CountUp to={masteredTotal} duration={900} />
            </p>
            <p className="mt-0.5 text-xs text-blue-500">
              <CountUp to={masteredPct} duration={900} suffix="%" /> tổng thẻ
            </p>
          </div>

          {/* Tổng thẻ */}
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs text-slate-500">Tổng thẻ</span>
            </div>
            <p className="text-on-surface text-xl font-bold">
              <CountUp to={totalCards} duration={900} />
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              trong <CountUp to={decks.length} duration={600} /> bộ thẻ
            </p>
          </div>

          {/* Cần ôn */}
          <div className="rounded-xl bg-orange-50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs text-orange-600">Cần ôn hôm nay</span>
            </div>
            <p className="text-on-surface text-xl font-bold">
              <CountUp to={totalDue} duration={900} />
            </p>
            <p className="mt-0.5 text-xs text-orange-400">
              {totalDue === 0 ? 'Đã hoàn thành!' : 'thẻ chờ bạn'}
            </p>
          </div>

          {/* Ngôn ngữ */}
          <div className="rounded-xl bg-emerald-50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600">Ngôn ngữ</span>
            </div>
            <div className="flex items-center gap-2">
              {zhDecks > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  CN ×{zhDecks}
                </span>
              )}
              {enDecks > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  EN ×{enDecks}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-emerald-500">
              {zhDecks + enDecks} bộ thẻ đang học
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
