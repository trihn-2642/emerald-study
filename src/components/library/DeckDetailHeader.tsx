import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import { DeleteDeckDialog } from '@/components/library/DeleteDeckDialog';
import { LANGUAGE_LABELS } from '@/constants';
import { cn } from '@/lib/utils';

import type { DeckDetail } from '@/lib/data/library';

type Props = {
  deck: DeckDetail;
};

function DeckDetailHeader({ deck }: Props) {
  const {
    id,
    name,
    description,
    language,
    card_count,
    due_count,
    mastery_percent,
    new_count,
  } = deck;

  const langConfig = LANGUAGE_LABELS[language as keyof typeof LANGUAGE_LABELS];

  const stats = [
    {
      icon: Layers,
      label: 'Tổng thẻ',
      value: card_count,
      className: 'text-slate-600',
      bgClass: 'bg-slate-100',
    },
    {
      icon: Clock,
      label: 'Cần ôn',
      value: due_count,
      className: 'text-orange-600',
      bgClass: 'bg-orange-50',
    },
    {
      icon: Sparkles,
      label: 'Thẻ mới',
      value: new_count,
      className: 'text-blue-600',
      bgClass: 'bg-blue-50',
    },
    {
      icon: CheckCircle,
      label: 'Thuộc lòng',
      value: `${mastery_percent ?? 0}%`,
      className: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
    },
  ];

  return (
    <div className="mb-6">
      {/* Back */}
      <Link
        href="/library"
        className="text-on-muted hover:text-on-surface mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Thư viện
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <BookOpen className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-on-surface text-xl font-bold">{name}</h1>
              {langConfig && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    langConfig.className,
                  )}
                >
                  {langConfig.label}
                </span>
              )}
            </div>
            {description && (
              <p className="text-on-muted mt-0.5 text-sm">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {due_count > 0 && (
            <Link
              href={`/study/${id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Học ngay ({due_count})
            </Link>
          )}
          <DeleteDeckDialog deckId={id} deckName={name} />
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                stat.bgClass,
              )}
            >
              <stat.icon className={cn('h-4 w-4', stat.className)} />
            </div>
            <div>
              <p className="text-on-surface text-lg font-bold">{stat.value}</p>
              <p className="text-on-muted text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { DeckDetailHeader };
