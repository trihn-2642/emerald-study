import { MoreVertical } from 'lucide-react';
import Link from 'next/link';

import { LANGUAGE_LABELS } from '@/constants';
import { cn } from '@/lib/utils';

import type { Deck } from '@/types';

type Props = {
  deck: Deck;
};

export function DeckCard({ deck }: Props) {
  const lang = LANGUAGE_LABELS[deck.language] ?? LANGUAGE_LABELS.en;
  const hasDue = deck.due_count > 0;
  const studyHref = hasDue ? `/study/${deck.id}` : `/library/${deck.id}`;

  return (
    <div className="group flex flex-col rounded-xl border-b-4 border-transparent bg-white p-6 shadow-sm transition-all hover:border-emerald-500 hover:bg-slate-50">
      <div className="mb-5 flex items-start justify-between">
        <span
          className={cn(
            'rounded px-3 py-1 text-[10px] font-black uppercase',
            lang.className,
          )}
        >
          {lang.label}
        </span>
        <MoreVertical className="h-4 w-4 text-slate-300 transition-colors group-hover:text-emerald-300" />
      </div>

      <h4 className="text-on-surface text-base font-bold">{deck.name}</h4>
      <p className="mt-2 mb-6 line-clamp-2 flex-1 text-xs text-slate-400">
        {deck.description || 'Không có mô tả.'}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-black text-emerald-600">
            {deck.due_count}
          </span>
          <span className="text-[10px] tracking-tighter text-slate-400 uppercase">
            Thẻ đến hạn
          </span>
        </div>
        <Link
          href={studyHref}
          className="bg-surface-input text-on-surface rounded-lg px-5 py-2 text-xs font-bold transition-colors hover:bg-emerald-500 hover:text-white"
        >
          {hasDue ? 'Học ngay' : 'Xem thẻ'}
        </Link>
      </div>
    </div>
  );
}
