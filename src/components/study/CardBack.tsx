'use client';

import { Volume2 } from 'lucide-react';

import type { Example, Flashcard } from '@/types';

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

function ExampleRow({ example, lang }: { example: Example; lang: string }) {
  const isZh = lang === 'zh';
  const primaryText = isZh ? example.cn : example.en;

  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-on-surface text-sm leading-snug font-medium">
          {primaryText}
        </p>
        {primaryText && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              speak(primaryText, lang);
            }}
            className="mt-0.5 shrink-0 cursor-pointer text-slate-300 transition-colors hover:text-emerald-500"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        )}
      </div>
      {isZh && example.py && (
        <p className="mt-0.5 text-xs text-slate-400">{example.py}</p>
      )}
      {example.vn && (
        <p className="mt-1 text-xs text-emerald-700">{example.vn}</p>
      )}
      {!isZh && example.cn && (
        <p className="mt-0.5 text-xs text-slate-400">{example.cn}</p>
      )}
      {isZh && example.en && (
        <p className="mt-0.5 text-xs text-slate-400 italic">{example.en}</p>
      )}
    </div>
  );
}

export function CardBack({ card }: Props) {
  const hasExamples = card.examples && card.examples.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Card mini-header */}
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
        <span className="text-on-surface font-cn text-2xl font-light">
          {card.front}
        </span>
        {card.pinyin && (
          <span className="text-sm text-slate-400">{card.pinyin}</span>
        )}
      </div>

      {/* Examples */}
      {hasExamples ? (
        <div className="flex-1 space-y-2 overflow-y-auto">
          <p className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Ví dụ
          </p>
          {card.examples.map((ex, i) => (
            <ExampleRow key={i} example={ex} lang={card.language} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-300 italic">Không có ví dụ.</p>
        </div>
      )}
    </div>
  );
}
