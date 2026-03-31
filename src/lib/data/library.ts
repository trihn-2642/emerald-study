'use server';

import { revalidatePath } from 'next/cache';
import { cache } from 'react';

import { createClient, getUser } from '@/lib/supabase/server';
import { DeckFormData, deckSchema } from '@/lib/validations/card';

import type { Deck, Flashcard } from '@/types';

export interface DeckDetail extends Deck {
  new_count: number;
  mastered_count: number;
  learning_count: number;
}

export const getAllDecks = cache(async function getAllDecks(
  userId: string,
): Promise<Deck[]> {
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
        .eq('fsrs_data->>state', '2');

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
});

export async function getDeckById(
  deckId: string,
  userId: string,
): Promise<DeckDetail | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: deck } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', userId)
    .single();

  if (!deck) return null;

  const [
    { count: cardCount },
    { count: dueCount },
    { count: masteredCount },
    { count: learningCount },
    { count: newCount },
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
    // state=2 (Review) — matches "Đã thuộc" badge in table
    supabase
      .from('flashcards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deckId)
      .eq('fsrs_data->>state', '2'),
    // state=1 (Learning) — matches "Đang học" badge in table
    supabase
      .from('flashcards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deckId)
      .eq('fsrs_data->>state', '1'),
    supabase
      .from('flashcards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deckId)
      .eq('fsrs_data->>state', '0'),
  ]);

  const total = cardCount ?? 0;
  const mastered = masteredCount ?? 0;
  const mastery = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return {
    ...deck,
    card_count: total,
    due_count: dueCount ?? 0,
    mastery_percent: mastery,
    mastered_count: mastered,
    learning_count: learningCount ?? 0,
    new_count: newCount ?? 0,
  } as DeckDetail;
}

export async function getFlashcardsByDeck(
  deckId: string,
): Promise<Flashcard[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('flashcards')
    .select('*')
    .eq('deck_id', deckId)
    .order('next_review', { ascending: true });

  if (!data) return [];
  return data as Flashcard[];
}

// ─── Deck mutations ────────────────────────────────────────────────────────────

export async function createDeck(
  input: DeckFormData,
): Promise<{ error: string } | { success: true }> {
  const parsed = deckSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await getUser();
  if (!user) return { error: 'Chưa đăng nhập.' };

  const supabase = await createClient();
  const { error } = await supabase.from('decks').insert({
    ...parsed.data,
    user_id: user.id,
  });

  if (error) return { error: 'Không thể tạo bộ thẻ. Vui lòng thử lại.' };

  revalidatePath('/library');
  return { success: true };
}

export async function deleteDeck(
  deckId: string,
): Promise<{ error: string } | { success: true }> {
  const user = await getUser();
  if (!user) return { error: 'Chưa đăng nhập.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', user.id);

  if (error) return { error: 'Không thể xóa bộ thẻ. Vui lòng thử lại.' };

  revalidatePath('/library');
  return { success: true };
}

export type DeckUpdateInput = {
  name: string;
  description?: string;
  language: 'zh' | 'en';
};

export async function updateDeck(
  deckId: string,
  input: DeckUpdateInput,
): Promise<{ error: string } | { success: true }> {
  const user = await getUser();
  if (!user) return { error: 'Chưa đăng nhập.' };

  const parsed = deckSchema.safeParse(input);

  if (!parsed.success) return { error: 'Dữ liệu không hợp lệ.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('decks')
    .update(parsed.data)
    .eq('id', deckId)
    .eq('user_id', user.id);

  if (error) return { error: 'Không thể cập nhật bộ thẻ. Vui lòng thử lại.' };

  revalidatePath('/library');
  return { success: true };
}
