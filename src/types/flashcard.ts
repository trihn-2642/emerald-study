export interface FsrsData {
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number; // 0: New | 1: Learning | 2: Review | 3: Relearning
  last_review: string | null; // ISO timestamp UTC
}

export interface Example {
  cn: string;
  py: string;
  vn: string;
  en: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  user_id: string;
  front: string;
  pinyin: string;
  meaning_vn: string;
  meaning_en: string;
  examples: Example[];
  fsrs_data: FsrsData;
  next_review: string; // ISO timestamp UTC
  created_at: string;
  language: 'zh' | 'en';
  word_type?: string;
}

export interface Deck {
  id: string;
  user_id: string;
  name: string;
  description: string;
  language: 'zh' | 'en';
  card_count: number;
  due_count: number; // computed from query, not stored in DB
  mastery_percent: number; // computed from query, not stored in DB
  created_at: string;
}
