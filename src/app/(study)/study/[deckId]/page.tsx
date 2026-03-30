import { redirect } from 'next/navigation';

import { getAllCards, getDueCards } from '@/lib/data/study';

import { StudySession } from './session';

type Props = {
  params: Promise<{ deckId: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function StudyPage({ params, searchParams }: Props) {
  const { deckId } = await params;
  const { mode } = await searchParams;

  const isReviewAll = mode === 'review';
  const result = isReviewAll
    ? await getAllCards(deckId)
    : await getDueCards(deckId);

  if (!result) {
    redirect('/library');
  }

  if (result.cards.length === 0) {
    redirect(`/library/${deckId}/cards`);
  }

  return (
    <StudySession
      initialCards={result.cards}
      deck={result.deck}
      mode={isReviewAll ? 'review' : 'due'}
    />
  );
}
