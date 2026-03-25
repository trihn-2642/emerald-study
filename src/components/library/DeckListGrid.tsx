'use client';

import { Plus, Search } from 'lucide-react';
import { useOptimistic, useState } from 'react';

import { CreateDeckDialog } from '@/components/library/CreateDeckDialog';
import { LibraryDeckCard } from '@/components/library/LibraryDeckCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type { DeckFormData } from '@/components/library/CreateDeckDialog';
import type { Deck } from '@/types';

type FilterValue = 'all' | 'zh' | 'en';
type SortValue = 'due' | 'mastery' | 'name' | 'name-desc';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'zh', label: 'Tiếng Trung' },
  { value: 'en', label: 'Tiếng Anh' },
];

const SORTS: { value: SortValue; label: string }[] = [
  { value: 'due', label: 'Ngày ôn tập' },
  { value: 'mastery', label: 'Mức độ thuộc' },
  { value: 'name', label: 'Tên A-Z' },
  { value: 'name-desc', label: 'Tên Z-A' },
];

type Props = {
  decks: Deck[];
};

function DeckListGrid({ decks }: Props) {
  const [filter, setFilter] = useState<FilterValue>('all');
  const [sortBy, setSortBy] = useState<SortValue>('due');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const [optimisticDecks, addOptimisticDeck] = useOptimistic(
    decks,
    (state, newDeck: Deck) => [...state, newDeck],
  );

  function handleOptimisticCreate(data: DeckFormData) {
    addOptimisticDeck({
      id: `temp-${Date.now()}`,
      user_id: '',
      name: data.name,
      description: data.description ?? '',
      language: data.language,
      card_count: 0,
      due_count: 0,
      mastery_percent: 0,
      created_at: new Date().toISOString(),
    });
  }

  const filtered = optimisticDecks.filter(
    (d) =>
      (filter === 'all' || d.language === filter) &&
      (!query || d.name.toLowerCase().includes(query.toLowerCase())),
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'due') return (b.due_count ?? 0) - (a.due_count ?? 0);
    if (sortBy === 'mastery')
      return (b.mastery_percent ?? 0) - (a.mastery_percent ?? 0);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'vi');
    return a.name.localeCompare(b.name, 'vi');
  });

  return (
    <div>
      {/* Controls — all on one row */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {/* Filter chips */}
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-emerald-600 text-white'
                : 'text-on-muted bg-white shadow-sm hover:bg-emerald-50 hover:text-emerald-700',
            )}
          >
            {f.label}
          </button>
        ))}

        <div className="flex-1" />

        {/* Compact search */}
        <div className="relative w-50 shrink-0">
          <Search className="text-on-muted absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bộ thẻ..."
            className="border-input bg-background text-on-surface placeholder:text-muted-foreground focus:ring-ring h-8 w-full rounded-lg border pr-2 pl-7 text-xs focus:ring-1 focus:outline-none"
          />
        </div>

        {/* Sort with label */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-on-muted text-xs font-medium tracking-wide uppercase">
            Sắp xếp theo
          </span>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortValue)}
          >
            <SelectTrigger className="h-8 w-40 cursor-pointer bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((deck) => (
          <LibraryDeckCard
            key={deck.id}
            deck={deck}
            isOptimistic={deck.id.startsWith('temp-')}
          />
        ))}

        {/* Add new deck placeholder */}
        <button
          onClick={() => setCreateOpen(true)}
          className="group flex min-h-45 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-5 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-emerald-100">
            <Plus className="h-5 w-5 text-slate-400 group-hover:text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-slate-400 group-hover:text-emerald-600">
            Thêm bộ thẻ mới
          </p>
        </button>
      </div>

      {sorted.length === 0 && (
        <p className="text-on-muted mt-6 text-center text-sm">
          {query
            ? `Không tìm thấy bộ thẻ nào với tên "${query}".`
            : 'Không có bộ thẻ nào cho ngôn ngữ này.'}
        </p>
      )}

      <CreateDeckDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onOptimisticCreate={handleOptimisticCreate}
      />
    </div>
  );
}

export { DeckListGrid };
