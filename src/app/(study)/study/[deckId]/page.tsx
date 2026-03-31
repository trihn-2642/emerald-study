import { redirect } from 'next/navigation';

import { getAllCards, getDueCards } from '@/lib/data/study';
import { generatePath, ROUTES } from '@/lib/routes';

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
    redirect(ROUTES.LIBRARY);
  }

  if (result.cards.length === 0) {
    redirect(generatePath(ROUTES.DECK_CARDS, { deckId }));
  }

  return (
    <StudySession
      initialCards={result.cards}
      deck={result.deck}
      mode={isReviewAll ? 'review' : 'due'}
    />
  );
}
