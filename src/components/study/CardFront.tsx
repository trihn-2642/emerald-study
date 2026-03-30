'use client';

import { Volume2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { LANGUAGE_LABELS } from '@/constants';
import { cn } from '@/lib/utils';

import type { Flashcard } from '@/types';

type Props = {
  card: Flashcard;
};

function speak(text: string, lang: string) {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
  window.speechSynthesis.speak(utterance);
}

export function CardFront({ card }: Props) {
  const lang = LANGUAGE_LABELS[card.language] ?? LANGUAGE_LABELS.en;
  const isZh = card.language === 'zh';

  return (
    <div className="flex h-full flex-col">
      {/* Language badge */}
      <div className="mb-4">
        <Badge
          variant="outline"
          className={cn('text-[10px] font-black uppercase', lang.className)}
        >
          {lang.label}
        </Badge>
      </div>

      {/* Character / vocabulary */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p
          className={cn(
            'text-on-surface leading-none font-light',
            isZh ? 'font-cn text-6xl md:text-8xl' : 'text-5xl md:text-7xl',
          )}
        >
          {card.front}
        </p>

        {/* Pinyin / secondary text + volume */}
        <div className="flex items-center gap-2">
          {card.pinyin && (
            <span className="text-lg text-slate-400 md:text-xl">
              {card.pinyin}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              speak(card.front, card.language);
            }}
            className="cursor-pointer text-slate-300 transition-colors hover:text-emerald-500"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Meanings */}
      <div className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-center">
        <p className="text-on-surface text-base font-semibold">
          {card.meaning_vn}
        </p>
        {card.meaning_en && (
          <p className="text-sm text-slate-400">{card.meaning_en}</p>
        )}
      </div>

      {/* Flip hint */}
      <div className="mt-5 text-center">
        <span className="text-[11px] font-medium tracking-widest text-slate-300 uppercase">
          ↑↑ nhấn để xem ví dụ ↑↑
        </span>
      </div>
    </div>
  );
}
