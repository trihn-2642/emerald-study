'use server';

import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { z } from 'zod';

import { createClient, getUser } from '@/lib/supabase/server';

import type { Deck, Flashcard } from '@/types';

export interface DeckDetail extends Deck {
  new_count: number;
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
    supabase
      .from('flashcards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deckId)
      .gte('fsrs_data->>stability', '21'),
    supabase
      .from('flashcards')
      .select('id', { count: 'exact', head: true })
      .eq('deck_id', deckId)
      .eq('fsrs_data->>state', '0'),
  ]);

  const total = cardCount ?? 0;
  const mastery =
    total > 0 ? Math.round(((masteredCount ?? 0) / total) * 100) : 0;

  return {
    ...deck,
    card_count: total,
    due_count: dueCount ?? 0,
    mastery_percent: mastery,
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

const deckSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên bộ thẻ không được để trống')
    .max(100, 'Tối đa 100 ký tự'),
  description: z.string().max(500, 'Tối đa 500 ký tự').optional(),
  language: z.enum(['zh', 'en'], {
    error: 'Vui lòng chọn ngôn ngữ',
  }),
});

export type DeckInput = z.infer<typeof deckSchema>;

export async function createDeck(
  input: DeckInput,
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

  const parsed = z
    .object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      language: z.enum(['zh', 'en']),
    })
    .safeParse(input);

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
