import { notFound } from 'next/navigation';

import { CardForm } from '@/components/cards/CardForm';
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
      <CardForm
        deckId={deckId}
        deckName={deck.name}
        deckLanguage={deck.language}
        initialData={card}
      />
    </div>
  );
}
