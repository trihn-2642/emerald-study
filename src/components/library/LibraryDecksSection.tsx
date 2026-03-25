import { DeckListGrid } from '@/components/library/DeckListGrid';
import { getAllDecks } from '@/lib/data/library';

type Props = {
  userId: string;
};

export async function LibraryDecksSection({ userId }: Props) {
  const decks = await getAllDecks(userId);
  return <DeckListGrid decks={decks} />;
}
