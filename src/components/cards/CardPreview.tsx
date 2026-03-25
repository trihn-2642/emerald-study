'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';

import type { CardFormData } from '@/lib/validations/card';

type Props = {
  form: UseFormReturn<CardFormData>;
};

function CardPreview({ form }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { watch } = form;

  const front = watch('front');
  const pinyin = watch('pinyin');
  const meaningVn = watch('meaning_vn');
  const meaningEn = watch('meaning_en');
  const language = watch('language');

  return (
    <div className="sticky top-6">
      <p className="text-on-muted mb-3 text-sm font-medium">Preview</p>

      {/* Card container */}
      <div
        className="relative cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped((f) => !f)}
      >
        <div
          className={cn(
            'relative min-h-48 w-full rounded-2xl transition-all duration-500 transform-3d',
            isFlipped ? 'transform-[rotateY(180deg)]' : '',
          )}
        >
          {/* Front face */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-md backface-hidden">
            {front ? (
              <p
                className={cn(
                  'text-on-surface text-center font-semibold',
                  language === 'zh' ? 'font-cn text-3xl' : 'text-2xl',
                )}
              >
                {front}
              </p>
            ) : (
              <p className="text-center text-sm text-slate-400">Mặt trước...</p>
            )}
          </div>

          {/* Back face */}
          <div className="absolute inset-0 flex transform-[rotateY(180deg)] flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 shadow-md backface-hidden">
            {language === 'zh' && pinyin && (
              <p className="text-on-muted text-sm">{pinyin}</p>
            )}
            {meaningVn ? (
              <p className="text-on-surface text-center text-lg font-semibold">
                {meaningVn}
              </p>
            ) : null}
            {meaningEn ? (
              <p className="text-on-muted text-sm">{meaningEn}</p>
            ) : null}
            {!pinyin && !meaningVn && !meaningEn && (
              <p className="text-center text-sm text-slate-400">Mặt sau...</p>
            )}
          </div>
        </div>
      </div>

      <p className="text-on-muted mt-2 text-center text-xs">Click để lật thẻ</p>
    </div>
  );
}

export { CardPreview };
