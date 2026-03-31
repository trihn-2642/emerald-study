import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { ROUTES } from '@/lib/routes';

import { DeckCard } from './DeckCard';

import type { Deck } from '@/types';

type Props = {
  decks: Deck[];
};

export function DeckGrid({ decks }: Props) {
  return (
    <section className="lg:col-span-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h3 className="text-on-surface text-2xl font-extrabold">
            Bộ thẻ cần ôn
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Dựa trên thuật toán lặp lại ngắt quãng (SRS)
          </p>
        </div>
        <Link
          href={ROUTES.LIBRARY}
          className="flex items-center gap-0.5 text-sm font-bold text-emerald-600 hover:underline"
        >
          Xem tất cả
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {decks.length === 0 ? (
        <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-slate-400">
            Chưa có bộ thẻ nào.{' '}
            <Link
              href={ROUTES.LIBRARY}
              className="font-semibold text-emerald-600 hover:underline"
            >
              Tạo thẻ mới
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </section>
  );
}
