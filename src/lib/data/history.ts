'use server';

import dayjs from 'dayjs';

import { createClient } from '@/lib/supabase/server';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export type StudySessionPayload = {
  deck_id: string;
  started_at: string;
  ended_at: string;
  duration_sec: number;
  cards_total: number;
  cards_reviewed: number;
  correct_count: number;
  mode: 'due' | 'review';
  rating_breakdown: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
};

export type StudySessionRow = {
  id: string;
  deck_id: string;
  deck_name: string;
  deck_language: 'zh' | 'en';
  deck_description: string;
  started_at: string;
  duration_sec: number;
  cards_total: number;
  cards_reviewed: number;
  correct_count: number;
  mode: 'due' | 'review';
  rating_breakdown: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
};

export type PeriodStats = {
  total_time_sec: number;
  total_reviewed: number;
  avg_accuracy: number;
};

export type StudyHistoryResult = {
  sessions: StudySessionRow[];
  total: number;
  stats: PeriodStats;
  prev_stats: PeriodStats | null;
  decks: { id: string; name: string }[];
};

export type Period = 'week' | 'month' | 'all';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function getPeriodRange(period: Period): { from: string; to: string } | null {
  if (period === 'week') {
    return {
      from: dayjs().startOf('week').toISOString(),
      to: dayjs().endOf('week').toISOString(),
    };
  }
  if (period === 'month') {
    return {
      from: dayjs().startOf('month').toISOString(),
      to: dayjs().endOf('month').toISOString(),
    };
  }
  return null;
}

function getPrevPeriodRange(
  period: Period,
): { from: string; to: string } | null {
  if (period === 'week') {
    return {
      from: dayjs().subtract(1, 'week').startOf('week').toISOString(),
      to: dayjs().subtract(1, 'week').endOf('week').toISOString(),
    };
  }
  if (period === 'month') {
    return {
      from: dayjs().subtract(1, 'month').startOf('month').toISOString(),
      to: dayjs().subtract(1, 'month').endOf('month').toISOString(),
    };
  }
  return null;
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function queryStats(
  supabase: SupabaseClient,
  userId: string,
  range: { from: string; to: string } | null,
  deckId: string | undefined,
): Promise<PeriodStats> {
  let q = supabase
    .from('study_sessions')
    .select('duration_sec, cards_reviewed, correct_count')
    .eq('user_id', userId);

  if (range) {
    q = q.gte('started_at', range.from).lte('started_at', range.to);
  }
  if (deckId) {
    q = q.eq('deck_id', deckId);
  }

  const { data } = await q;
  if (!data || data.length === 0) {
    return { total_time_sec: 0, total_reviewed: 0, avg_accuracy: 0 };
  }

  const total_time_sec = data.reduce((s, r) => s + (r.duration_sec ?? 0), 0);
  const total_reviewed = data.reduce((s, r) => s + (r.cards_reviewed ?? 0), 0);
  const validRows = data.filter((r) => (r.cards_reviewed ?? 0) > 0);
  const avg_accuracy =
    validRows.length > 0
      ? Math.round(
          validRows.reduce(
            (sum, r) => sum + (r.correct_count / r.cards_reviewed) * 100,
            0,
          ) / validRows.length,
        )
      : 0;

  return { total_time_sec, total_reviewed, avg_accuracy };
}

// --------------------------------------------------------------------------
// Server Action: save a completed session
// --------------------------------------------------------------------------

export async function saveStudySession(
  payload: StudySessionPayload,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('study_sessions').insert({
    user_id: user.id,
    ...payload,
  });
}

// --------------------------------------------------------------------------
// Data: fetch history list + stats
// --------------------------------------------------------------------------

export async function getStudyHistory(
  userId: string,
  options: {
    deckId?: string;
    period: Period;
    page: number;
    limit: number;
  },
): Promise<StudyHistoryResult> {
  const supabase = await createClient();
  const { deckId, period, page, limit } = options;

  const range = getPeriodRange(period);
  const prevRange = getPrevPeriodRange(period);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Main sessions query with deck join
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = supabase
    .from('study_sessions')
    .select(
      'id, deck_id, started_at, duration_sec, cards_total, cards_reviewed, correct_count, mode, rating_breakdown, decks(id, name, language, description)',
      { count: 'exact' },
    )
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .range(from, to);

  if (range) {
    q = q.gte('started_at', range.from).lte('started_at', range.to);
  }
  if (deckId) {
    q = q.eq('deck_id', deckId);
  }

  const { data, count } = await q;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessions: StudySessionRow[] = (data ?? []).map((row: any) => ({
    id: row.id,
    deck_id: row.deck_id,
    deck_name: row.decks?.name ?? 'Bộ thẻ không tồn tại',
    deck_language: (row.decks?.language ?? 'en') as 'zh' | 'en',
    deck_description: row.decks?.description ?? '',
    started_at: row.started_at,
    duration_sec: row.duration_sec ?? 0,
    cards_total: row.cards_total ?? 0,
    cards_reviewed: row.cards_reviewed ?? 0,
    correct_count: row.correct_count ?? 0,
    mode: (row.mode ?? 'due') as 'due' | 'review',
    rating_breakdown: row.rating_breakdown ?? {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    },
  }));

  const [stats, prev_stats, decksData] = await Promise.all([
    queryStats(supabase, userId, range, deckId),
    prevRange
      ? queryStats(supabase, userId, prevRange, deckId)
      : Promise.resolve(null),
    supabase
      .from('decks')
      .select('id, name')
      .eq('user_id', userId)
      .order('name'),
  ]);

  return {
    sessions,
    total: count ?? 0,
    stats,
    prev_stats,
    decks: (decksData.data ?? []).map((d) => ({ id: d.id, name: d.name })),
  };
}
