'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type { Period } from '@/lib/data/history';

type Props = {
  decks: { id: string; name: string }[];
  currentDeck: string;
  currentPeriod: Period;
};

const PERIODS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
  { value: 'all', label: 'Tất cả' },
];

export function HistoryFilters({ decks, currentDeck, currentPeriod }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set('page', '1'); // reset pagination on filter change
    router.push(`/study/history?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Deck select */}
      <Select value={currentDeck} onValueChange={(v) => updateParam('deck', v)}>
        <SelectTrigger className="h-9 w-44 max-w-44 bg-white text-sm">
          <SelectValue placeholder="Tất cả bộ thẻ" className="truncate" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả bộ thẻ</SelectItem>
          {decks.map((d) => (
            <SelectItem
              key={d.id}
              value={d.id}
              title={d.name}
              className="max-w-64"
            >
              <span className="block max-w-56 truncate">{d.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Period toggle */}
      <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => updateParam('period', p.value)}
            className={cn(
              'cursor-pointer px-4 py-1.5 text-sm font-semibold transition-colors',
              currentPeriod === p.value
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-50',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
