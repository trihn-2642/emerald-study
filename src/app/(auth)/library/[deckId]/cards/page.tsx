import { notFound } from 'next/navigation';

import { DeckDetailHeader } from '@/components/cards/DeckDetailHeader';
import { FlashcardTable } from '@/components/cards/FlashcardTable';
import { getDeckById, getFlashcardsByDeck } from '@/lib/data/library';
import { getUser } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ deckId: string }>;
};

export default async function DeckDetailPage({ params }: Props) {
  const { deckId } = await params;
  const user = await getUser();

  if (!user) notFound();

  const [deck, flashcards] = await Promise.all([
    getDeckById(deckId, user.id),
    getFlashcardsByDeck(deckId),
  ]);

  if (!deck) notFound();

  return (
    <div className="p-4 md:p-6">
      <DeckDetailHeader deck={deck} />
      <FlashcardTable
        flashcards={flashcards}
        deckId={deckId}
        language={deck.language}
      />
    </div>
  );
}
