import { notFound } from 'next/navigation';

import { CardForm } from '@/components/cards/CardForm';
import { getDeckById } from '@/lib/data/library';
import { getUser } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ deckId: string }>;
};

export default async function NewCardPage({ params }: Props) {
  const { deckId } = await params;
  const user = await getUser();
  if (!user) notFound();

  const deck = await getDeckById(deckId, user.id);
  if (!deck) notFound();

  return (
    <div className="p-4 md:p-6">
      <CardForm
        deckId={deckId}
        deckName={deck.name}
        deckLanguage={deck.language}
      />
    </div>
  );
}
