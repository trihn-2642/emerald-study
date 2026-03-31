'use server';

import { cache } from 'react';

import { createClient, getUser } from '@/lib/supabase/server';

import type { FsrsData , Deck, Flashcard } from '@/types';

export interface StudySession {
  cards: Flashcard[];
  deck: Deck;
}

export const getDueCards = cache(async function getDueCards(
  deckId: string,
): Promise<StudySession | null> {
  const supabase = await createClient();
  const user = await getUser();
  const now = new Date().toISOString();

  const { data: deck } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single();

  if (!deck) return null;

  const [
    { count: cardCount },
    { count: dueCount },
    { count: masteredCount },
    { data: cards },
  ] = await Promise.all([
    supabase
      .from('flashcards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deckId),
    supabase
      .from('flashcards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deckId)
      .lte('next_review', now),
    supabase
      .from('flashcards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deckId)
      .eq('fsrs_data->>state', '2'),
    supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .eq('user_id', user.id)
      .lte('next_review', now)
      .order('next_review', { ascending: true }),
  ]);

  const total = cardCount ?? 0;
  const mastery =
    total > 0 ? Math.round(((masteredCount ?? 0) / total) * 100) : 0;

  return {
    cards: (cards ?? []) as Flashcard[],
    deck: {
      ...deck,
      card_count: total,
      due_count: dueCount ?? 0,
      mastery_percent: mastery,
    } as Deck,
  };
});

export const getAllCards = cache(async function getAllCards(
  deckId: string,
): Promise<StudySession | null> {
  const supabase = await createClient();
  const user = await getUser();
  const now = new Date().toISOString();

  const { data: deck } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', user.id)
    .single();

  if (!deck) return null;

  const [
    { count: cardCount },
    { count: dueCount },
    { count: masteredCount },
    { data: cards },
  ] = await Promise.all([
    supabase
      .from('flashcards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deckId),
    supabase
      .from('flashcards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deckId)
      .lte('next_review', now),
    supabase
      .from('flashcards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deckId)
      .eq('fsrs_data->>state', '2'),
    supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
  ]);

  const total = cardCount ?? 0;
  const mastery =
    total > 0 ? Math.round(((masteredCount ?? 0) / total) * 100) : 0;

  return {
    cards: (cards ?? []) as Flashcard[],
    deck: {
      ...deck,
      card_count: total,
      due_count: dueCount ?? 0,
      mastery_percent: mastery,
    } as Deck,
  };
});

export async function updateCardAfterRating(
  cardId: string,
  fsrsData: FsrsData,
  nextReview: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('flashcards')
    .update({ fsrs_data: fsrsData, next_review: nextReview })
    .eq('id', cardId);
}
