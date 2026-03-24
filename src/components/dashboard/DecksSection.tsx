import { getDueDecks, getTodayStats } from '@/lib/data/dashboard';

import { DeckGrid } from './DeckGrid';
import { StatsRow } from './StatsRow';

import type { Deck } from '@/types';

type Props = { userId: string };

function computeStats(decks: Deck[]) {
  const totalCards = decks.reduce((sum, d) => sum + d.card_count, 0);
  const dueToday = decks.reduce((sum, d) => sum + d.due_count, 0);
  const masteryPercent =
    decks.length > 0
      ? Math.round(
          decks.reduce((sum, d) => sum + d.mastery_percent, 0) / decks.length,
        )
      : 0;
  return { totalCards, dueToday, masteryPercent };
}

export async function DecksSection({ userId }: Props) {
  let decks: Deck[] = [];
  let newCards = 0;
  let error = false;

  try {
    [decks, { newCards }] = await Promise.all([
      getDueDecks(userId),
      getTodayStats(userId),
    ]);
  } catch {
    error = true;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-400">
        Không thể tải danh sách bộ thẻ.
      </div>
    );
  }

  const { totalCards, dueToday, masteryPercent } = computeStats(decks);

  return (
    <div className="mb-0 space-y-8">
      <StatsRow
        totalCards={totalCards}
        dueToday={dueToday}
        masteryPercent={masteryPercent}
        newCards={newCards}
      />
      <DeckGrid decks={decks} />
    </div>
  );
}
