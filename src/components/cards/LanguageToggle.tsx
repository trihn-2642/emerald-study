'use client';

import { cn } from '@/lib/utils';

type Props = {
  value: 'zh' | 'en';
  onChange: (lang: 'zh' | 'en') => void;
};

function LanguageToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
      <button
        type="button"
        onClick={() => onChange('zh')}
        className={cn(
          'cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold transition-all',
          value === 'zh'
            ? 'bg-white text-emerald-700 shadow-sm'
            : 'text-on-muted hover:text-on-surface',
        )}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={cn(
          'cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold transition-all',
          value === 'en'
            ? 'bg-white text-emerald-700 shadow-sm'
            : 'text-on-muted hover:text-on-surface',
        )}
      >
        EN
      </button>
    </div>
  );
}

export { LanguageToggle };
