'use server';

import { revalidatePath } from 'next/cache';
import { createEmptyCard } from 'ts-fsrs';

import { createClient, getUser } from '@/lib/supabase/server';
import { cardSchema } from '@/lib/validations/card';

import type { CardFormData } from '@/lib/validations/card';
import type { Flashcard } from '@/types';

interface ActionResult {
  success?: boolean;
  error?: string;
  cardId?: string;
}

export async function getCardById(
  cardId: string,
  userId: string,
): Promise<Flashcard | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', cardId)
    .eq('user_id', userId)
    .single();

  return data ?? null;
}

export async function createCard(
  formData: CardFormData,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { error: 'Không có quyền truy cập' };

  const parsed = cardSchema.safeParse(formData);
  if (!parsed.success) return { error: 'Dữ liệu không hợp lệ' };

  const { deck_id, language, front, pinyin, meaning_vn, meaning_en, examples } =
    parsed.data;

  const empty = createEmptyCard();
  const fsrs_data = {
    stability: empty.stability,
    difficulty: empty.difficulty,
    elapsed_days: empty.elapsed_days,
    scheduled_days: empty.scheduled_days,
    reps: empty.reps,
    lapses: empty.lapses,
    state: empty.state,
    last_review: null,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('flashcards')
    .insert({
      deck_id,
      user_id: user.id,
      language,
      front,
      pinyin: pinyin ?? '',
      meaning_vn,
      meaning_en: meaning_en ?? '',
      examples: examples ?? [],
      fsrs_data,
      next_review: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) return { error: 'Không thể lưu thẻ. Vui lòng thử lại.' };

  revalidatePath(`/library/${deck_id}`);
  return { success: true, cardId: data.id };
}

export async function updateCard(
  id: string,
  formData: CardFormData,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { error: 'Không có quyền truy cập' };

  const parsed = cardSchema.safeParse(formData);
  if (!parsed.success) return { error: 'Dữ liệu không hợp lệ' };

  const { deck_id, language, front, pinyin, meaning_vn, meaning_en, examples } =
    parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from('flashcards')
    .update({
      language,
      front,
      pinyin: pinyin ?? '',
      meaning_vn,
      meaning_en: meaning_en ?? '',
      examples: examples ?? [],
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: 'Không thể lưu thẻ. Vui lòng thử lại.' };

  revalidatePath(`/library/${deck_id}`);
  return { success: true };
}

export async function deleteCard(
  id: string,
  deckId: string,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { error: 'Không có quyền truy cập' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: 'Không thể xóa thẻ. Vui lòng thử lại.' };

  revalidatePath(`/library/${deckId}`);
  return { success: true };
}
