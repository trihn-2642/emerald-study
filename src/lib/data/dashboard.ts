import { createClient } from '@/lib/supabase/server';

import type { Deck } from '@/types';

export interface TodayStats {
  reviewed: number;
  total: number;
  newCards: number;
}

export interface RecentActivity {
  id: string;
  description: string;
  timeAgo: string;
  color: 'orange' | 'emerald';
}

export async function getTodayStats(userId: string): Promise<TodayStats> {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: total } = await supabase
    .from('flashcards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_review', new Date().toISOString());

  const { count: reviewed } = await supabase
    .from('flashcards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('fsrs_data->>last_review', todayStart.toISOString());

  const { count: newCards } = await supabase
    .from('flashcards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('fsrs_data->>state', '0');

  return {
    reviewed: reviewed ?? 0,
    total: total ?? 0,
    newCards: newCards ?? 0,
  };
}

export async function getDueDecks(userId: string): Promise<Deck[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: decks } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!decks) return [];

  const decksWithStats = await Promise.all(
    decks.map(async (deck) => {
      const { count: cardCount } = await supabase
        .from('flashcards')
        .select('id', { count: 'exact', head: true })
        .eq('deck_id', deck.id);

      const { count: dueCount } = await supabase
        .from('flashcards')
        .select('id', { count: 'exact', head: true })
        .eq('deck_id', deck.id)
        .lte('next_review', now);

      const { count: masteredCount } = await supabase
        .from('flashcards')
        .select('id', { count: 'exact', head: true })
        .eq('deck_id', deck.id)
        .gte('fsrs_data->>stability', '21');

      const total = cardCount ?? 0;
      const mastery =
        total > 0 ? Math.round(((masteredCount ?? 0) / total) * 100) : 0;

      return {
        ...deck,
        card_count: total,
        due_count: dueCount ?? 0,
        mastery_percent: mastery,
      } as Deck;
    }),
  );

  return decksWithStats;
}

export async function getRecentActivity(
  userId: string,
): Promise<RecentActivity[]> {
  const supabase = await createClient();

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(0, 0, 0, 0);

  const { data: cards } = await supabase
    .from('flashcards')
    .select('deck_id, fsrs_data->>last_review')
    .eq('user_id', userId)
    .not('fsrs_data->>last_review', 'is', null)
    .gte('fsrs_data->>last_review', twoDaysAgo.toISOString());

  if (!cards || cards.length === 0) return [];

  // Group by deck, track count + most recent review time
  const byDeck = new Map<string, { count: number; lastReview: string }>();
  for (const card of cards as Array<{
    deck_id: string;
    last_review: string;
  }>) {
    const existing = byDeck.get(card.deck_id);
    if (!existing) {
      byDeck.set(card.deck_id, { count: 1, lastReview: card.last_review });
    } else {
      byDeck.set(card.deck_id, {
        count: existing.count + 1,
        lastReview:
          card.last_review > existing.lastReview
            ? card.last_review
            : existing.lastReview,
      });
    }
  }

  // Sort by most recently reviewed deck first
  const sorted = [...byDeck.entries()].sort(([, a], [, b]) =>
    b.lastReview > a.lastReview ? 1 : -1,
  );

  // Fetch deck names
  const deckIds = sorted.map(([id]) => id);
  const { data: decks } = await supabase
    .from('decks')
    .select('id, name')
    .in('id', deckIds);

  if (!decks) return [];
  const deckMap = new Map(decks.map((d) => [d.id, d.name as string]));

  const now = new Date();
  const colors: Array<'orange' | 'emerald'> = ['orange', 'emerald'];

  return sorted.slice(0, 5).map(([deckId, { count, lastReview }], i) => {
    const deckName = deckMap.get(deckId) ?? 'Bộ thẻ';
    const diffMs = now.getTime() - new Date(lastReview).getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffM = Math.floor(diffMs / (1000 * 60));

    let timeAgo: string;
    if (diffM < 60) timeAgo = `${diffM} phút trước`;
    else if (diffH < 24) timeAgo = `${diffH} giờ trước`;
    else timeAgo = 'Hôm qua';

    return {
      id: deckId,
      description: `Ôn tập ${count} thẻ ${deckName}`,
      timeAgo,
      color: colors[i % 2],
    };
  });
}

export async function getUserStreak(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('flashcards')
    .select('fsrs_data->>last_review')
    .eq('user_id', userId)
    .not('fsrs_data->>last_review', 'is', null)
    .order('fsrs_data->>last_review', { ascending: false });

  if (!data || data.length === 0) return 0;

  const reviewDates = new Set(
    data.map((r) => new Date(r.last_review as string).toDateString()),
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (reviewDates.has(d.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
