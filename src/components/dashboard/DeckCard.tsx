import Link from 'next/link';

import { LANGUAGE_LABELS } from '@/constants';
import { generatePath, ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { Badge } from '../ui/badge';

import type { Deck } from '@/types';

type Props = {
  deck: Deck;
};

export function DeckCard({ deck }: Props) {
  const lang = LANGUAGE_LABELS[deck.language] ?? LANGUAGE_LABELS.en;
  const hasDue = deck.due_count > 0;
  const studyHref = hasDue
    ? generatePath(ROUTES.STUDY_SESSION, { deckId: deck.id })
    : generatePath(ROUTES.DECK_CARDS, { deckId: deck.id });

  return (
    <div className="group flex flex-col rounded-xl border-b-4 border-transparent bg-white p-6 shadow-sm transition-all hover:border-emerald-500 hover:bg-slate-50">
      <div className="mb-5 flex items-start justify-between">
        <Badge
          variant="outline"
          className={cn('text-[10px] font-black uppercase', lang.className)}
        >
          {lang.label}
        </Badge>
      </div>

      <h4 className="text-on-surface truncate text-base font-bold whitespace-pre">
        {deck.name}
      </h4>
      <p
        className={cn(
          'mt-2 mb-4 line-clamp-2 flex-1 text-xs whitespace-break-spaces text-slate-400',
          !deck.description && 'text-slate-300 italic',
        )}
      >
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
