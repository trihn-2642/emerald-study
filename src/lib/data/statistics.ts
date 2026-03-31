import dayjs from 'dayjs';

import { createClient } from '@/lib/supabase/server';

import { getUserStreak } from './dashboard';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export type OverallStats = {
  total_cards: number;
  total_reviewed: number;
  total_time_sec: number;
  current_streak: number;
  avg_accuracy: number;
};

export type HeatmapData = Record<string, number>; // { 'YYYY-MM-DD': cards_reviewed }

export type FsrsBreakdown = {
  new: number; // state = 0
  learning: number; // state = 1
  review: number; // state = 2
  relearning: number; // state = 3
};

export type DeckStat = {
  id: string;
  name: string;
  language: 'zh' | 'en';
  card_count: number;
  mastery_percent: number;
  session_count: number;
  avg_accuracy: number;
  last_studied_at: string | null;
};

// --------------------------------------------------------------------------
// Overall all-time stats
// --------------------------------------------------------------------------

export async function getOverallStats(userId: string): Promise<OverallStats> {
  const supabase = await createClient();

  const [{ data: sessions }, { count: total_cards }, streak] =
    await Promise.all([
      supabase
        .from('study_sessions')
        .select('duration_sec, cards_reviewed, correct_count')
        .eq('user_id', userId),
      supabase
        .from('flashcards')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      getUserStreak(userId),
    ]);

  const total_time_sec =
    sessions?.reduce((s, r) => s + (r.duration_sec ?? 0), 0) ?? 0;
  const total_reviewed =
    sessions?.reduce((s, r) => s + (r.cards_reviewed ?? 0), 0) ?? 0;
  const validRows = sessions?.filter((r) => (r.cards_reviewed ?? 0) > 0) ?? [];
  const avg_accuracy =
    validRows.length > 0
      ? Math.round(
          validRows.reduce(
            (sum, r) => sum + (r.correct_count / r.cards_reviewed) * 100,
            0,
          ) / validRows.length,
        )
      : 0;

  return {
    total_cards: total_cards ?? 0,
    total_reviewed,
    total_time_sec,
    current_streak: streak,
    avg_accuracy,
  };
}

// --------------------------------------------------------------------------
// Activity heatmap — last 365 days
// --------------------------------------------------------------------------

export async function getActivityHeatmap(userId: string): Promise<HeatmapData> {
  const supabase = await createClient();
  const year = dayjs().year();
  const since = `${year}-01-01`;

  const { data } = await supabase
    .from('study_sessions')
    .select('started_at, cards_reviewed')
    .eq('user_id', userId)
    .gte('started_at', since);

  if (!data) return {};

  const map: HeatmapData = {};
  for (const row of data) {
    const day = dayjs(row.started_at).format('YYYY-MM-DD');
    map[day] = (map[day] ?? 0) + (row.cards_reviewed ?? 0);
  }
  return map;
}

// --------------------------------------------------------------------------
// FSRS state breakdown
// --------------------------------------------------------------------------

export async function getFsrsBreakdown(userId: string): Promise<FsrsBreakdown> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('flashcards')
    .select('fsrs_data->>state')
    .eq('user_id', userId);

  const counts: FsrsBreakdown = {
    new: 0,
    learning: 0,
    review: 0,
    relearning: 0,
  };
  for (const card of (data ?? []) as Array<{ state: string }>) {
    const state = Number(card.state);
    if (state === 0) counts.new++;
    else if (state === 1) counts.learning++;
    else if (state === 2) counts.review++;
    else if (state === 3) counts.relearning++;
  }
  return counts;
}

// --------------------------------------------------------------------------
// Per-deck stats
// --------------------------------------------------------------------------

export async function getDeckStats(userId: string): Promise<DeckStat[]> {
  const supabase = await createClient();

  const [{ data: decks }, { data: flashcards }, { data: sessions }] =
    await Promise.all([
      supabase.from('decks').select('id, name, language').eq('user_id', userId),
      supabase
        .from('flashcards')
        .select('deck_id, fsrs_data->>state')
        .eq('user_id', userId),
      supabase
        .from('study_sessions')
        .select('deck_id, cards_reviewed, correct_count, started_at')
        .eq('user_id', userId),
    ]);

  if (!decks) return [];

  const stats = decks.map((deck) => {
    const cards = (flashcards ?? []).filter(
      (c) => c.deck_id === deck.id,
    ) as Array<{
      deck_id: string;
      state: string;
    }>;
    const masteredCount = cards.filter((c) => c.state === '2').length;
    const mastery_percent =
      cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

    const deckSessions = (sessions ?? []).filter((s) => s.deck_id === deck.id);
    const validSessions = deckSessions.filter(
      (s) => (s.cards_reviewed ?? 0) > 0,
    );
    const avg_accuracy =
      validSessions.length > 0
        ? Math.round(
            validSessions.reduce(
              (sum, s) => sum + (s.correct_count / s.cards_reviewed) * 100,
              0,
            ) / validSessions.length,
          )
        : 0;

    const lastSession = [...deckSessions].sort((a, b) =>
      b.started_at > a.started_at ? 1 : -1,
    )[0];

    return {
      id: deck.id as string,
      name: deck.name as string,
      language: deck.language as 'zh' | 'en',
      card_count: cards.length,
      mastery_percent,
      session_count: deckSessions.length,
      avg_accuracy,
      last_studied_at: lastSession?.started_at ?? null,
    };
  });

  return stats.sort((a, b) => {
    if (!a.last_studied_at && !b.last_studied_at) return 0;
    if (!a.last_studied_at) return 1;
    if (!b.last_studied_at) return -1;
    return b.last_studied_at > a.last_studied_at ? 1 : -1;
  });
}
