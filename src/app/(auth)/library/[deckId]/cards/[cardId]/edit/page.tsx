import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CardForm } from '@/components/cards/CardForm';
import { DeleteCardButton } from '@/components/cards/DeleteCardButton';
import { getCardById } from '@/lib/data/cards';
import { getDeckById } from '@/lib/data/library';
import { getUser } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ deckId: string; cardId: string }>;
};

export default async function EditCardPage({ params }: Props) {
  const { deckId, cardId } = await params;
  const user = await getUser();
  if (!user) notFound();

  const [deck, card] = await Promise.all([
    getDeckById(deckId, user.id),
    getCardById(cardId, user.id),
  ]);

  if (!deck || !card) notFound();

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Link
          href={`/library/${deckId}`}
          className="text-on-muted hover:text-on-surface mb-4 flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {deck.name}
        </Link>
        <h1 className="text-on-surface text-2xl font-bold">Chỉnh sửa thẻ</h1>
        <p className="text-on-muted mt-1 text-sm">
          Chỉnh sửa thẻ trong bộ{' '}
          <span className="text-on-surface font-medium">{deck.name}</span>
        </p>
      </div>

      <CardForm deckId={deckId} deckName={deck.name} initialData={card} />

      <div className="mt-8 border-t border-slate-200 pt-6">
        <DeleteCardButton cardId={cardId} deckId={deckId} />
      </div>
    </div>
  );
}
