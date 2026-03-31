'use client';

import { Volume2 } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import type { Example } from '@/types';

type Props = {
  front: string;
  pinyin: string;
  meaningVn: string;
  meaningEn: string;
  language: 'zh' | 'en';
  examples: Example[];
};

function CardPreview({
  front,
  pinyin,
  meaningVn,
  meaningEn,
  language,
  examples,
}: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  function speakWord(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="sticky top-8 space-y-4">
      {/* Label + dots */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          Xem trước thẻ
        </h3>
        <div className="flex gap-1">
          <div
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              !isFlipped ? 'bg-emerald-500' : 'bg-slate-200',
            )}
          />
          <div
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              isFlipped ? 'bg-emerald-500' : 'bg-slate-200',
            )}
          />
        </div>
      </div>

      {/* Flashcard — 3D flip */}
      <div
        className="cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped((f) => !f)}
      >
        <div
          className="relative w-full"
          style={{
            aspectRatio: '4/3',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s ease',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front: character + pinyin + meanings on green */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-3xl p-8 text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-600 to-emerald-800" />
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <div className="absolute -top-8 -left-8 h-48 w-48 rounded-full bg-white blur-3xl" />
              <div className="absolute -right-8 -bottom-16 h-64 w-64 rounded-full bg-emerald-300 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-3">
              {front ? (
                <span
                  className={cn(
                    'block font-black tracking-tight text-white',
                    language === 'zh' ? 'font-cn text-6xl' : 'text-4xl',
                  )}
                >
                  {front}
                </span>
              ) : (
                <span className="text-6xl font-black text-white/30">…</span>
              )}

              {language === 'zh' && pinyin ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-emerald-100/90">
                    {pinyin}
                  </span>
                  <span
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(front);
                    }}
                  >
                    <Volume2 className="h-3 w-3 text-white" />
                  </span>
                </div>
              ) : language === 'en' && front ? (
                <span
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(front);
                  }}
                >
                  <Volume2 className="h-3 w-3 text-white" />
                </span>
              ) : null}

              <div className="flex flex-col items-center gap-0.5">
                {meaningVn ? (
                  <p className="text-base font-bold text-white">{meaningVn}</p>
                ) : (
                  <p className="text-sm text-white/40">Nghĩa tiếng Việt...</p>
                )}
                {language === 'zh' && meaningEn && (
                  <p className="text-sm text-white/70 italic">{meaningEn}</p>
                )}
                {language === 'en' && pinyin && (
                  <p className="text-sm text-white/70 italic">{pinyin}</p>
                )}
              </div>
            </div>

            <div className="absolute bottom-4 flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5 text-white/30"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.42z" />
              </svg>
              <p className="text-[9px] tracking-[0.2em] text-white/40 uppercase">
                Chạm để lật{examples.length > 0 ? ' [Xem ví dụ]' : ''}
              </p>
            </div>
          </div>

          {/* Back: examples on white */}
          <div
            className="absolute inset-0 flex flex-col rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Header row */}
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                {front && (
                  <span
                    className={cn(
                      'text-on-surface font-bold',
                      language === 'zh' ? 'font-cn text-sm' : 'text-sm',
                    )}
                  >
                    {front}
                  </span>
                )}
                {pinyin && (
                  <span className="text-xs text-emerald-600">{pinyin}</span>
                )}
              </div>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                Ví dụ minh họa
              </span>
            </div>

            {/* Examples list */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {examples && examples.length > 0 ? (
                examples.map((ex, i) => {
                  const speakText = language === 'zh' ? ex.cn : ex.en;
                  return (
                    <div key={i}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {language === 'zh' && ex.cn && (
                            <p className="font-cn text-on-surface text-sm font-bold">
                              {ex.cn}
                            </p>
                          )}
                          {language === 'en' && ex.en && (
                            <p className="text-on-surface text-sm font-bold">
                              {ex.en}
                            </p>
                          )}
                        </div>
                        {speakText && (
                          <span
                            className="mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-emerald-50 transition-colors hover:bg-emerald-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakWord(speakText);
                            }}
                          >
                            <Volume2 className="h-2.5 w-2.5 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      {ex.py && (
                        <p className="text-xs text-emerald-600 italic">
                          {ex.py}
                        </p>
                      )}
                      {ex.vn && (
                        <p className="mt-0.5 text-xs text-slate-500">{ex.vn}</p>
                      )}
                      {language === 'en' && ex.cn && (
                        <p className="font-cn mt-0.5 text-xs text-slate-400">
                          {ex.cn}
                        </p>
                      )}
                      {language === 'zh' && ex.en && (
                        <p className="mt-0.5 text-xs text-slate-400 italic">
                          {ex.en}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="py-4 text-center text-xs text-slate-300">
                  Chưa có ví dụ
                </p>
              )}
            </div>

            {/* Flip back hint */}
            <div className="mt-2 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-2">
              <svg
                className="h-3.5 w-3.5 text-slate-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              <p className="text-[9px] tracking-[0.2em] text-slate-300 uppercase">
                Quay lại mặt trước
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SRS strip */}
      <div className="flex items-center justify-center gap-2 py-1">
        <svg
          className="h-3.5 w-3.5 text-emerald-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 2v11h3v9l7-12h-4l4-8z" />
        </svg>
        <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
          Spaced Repetition System hoạt động
        </p>
      </div>

      {/* SRS info box */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            {/* Sparkle / 4-pointed star icon */}
            <svg
              className="h-3.5 w-3.5 text-emerald-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l2.4 7.6H22l-6.4 4.6 2.4 7.8L12 17.4l-6 4.6 2.4-7.8L2 9.6h7.6z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-800">
              Thuật toán ghi nhớ
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-700">
              Thẻ này sẽ xuất hiện lại sau 7 ngày nếu bạn đánh giá là
              &ldquo;Dễ&rdquo;.
            </p>
          </div>
        </div>
      </div>

      {/* Tip box */}
      <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
            {/* Location pin icon */}
            <svg
              className="h-3.5 w-3.5 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] leading-relaxed text-red-800">
              <span className="font-semibold">Mẹo:</span> Thêm ví dụ thực tế sẽ
              giúp não bộ liên kết thông tin tốt hơn 40%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CardPreview };
