'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, ChevronRight, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { CardPreview } from '@/components/cards/CardPreview';
import { DeckSelector } from '@/components/cards/DeckSelector';
import { ExampleList } from '@/components/cards/ExampleList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createCard, updateCard } from '@/lib/data/cards';
import { cn } from '@/lib/utils';
import { createCardSchema } from '@/lib/validations/card';

import type { CardFormData } from '@/lib/validations/card';
import type { Flashcard } from '@/types';

type Difficulty = 'easy' | 'medium' | 'hard';

type Props = {
  deckId: string;
  deckName: string;
  deckLanguage: 'zh' | 'en';
  initialData?: Flashcard;
};

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'DỄ' },
  { value: 'medium', label: 'VỪA' },
  { value: 'hard', label: 'KHÓ' },
];

const WORD_TYPES = [
  {
    value: 'noun',
    label: 'Danh từ',
    active: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  {
    value: 'verb',
    label: 'Động từ',
    active: 'border-purple-200 bg-purple-50 text-purple-700',
  },
  {
    value: 'adj',
    label: 'Tính từ',
    active: 'border-orange-200 bg-orange-50 text-orange-700',
  },
  {
    value: 'adv',
    label: 'Trạng từ',
    active: 'border-pink-200 bg-pink-50 text-pink-700',
  },
  {
    value: 'other',
    label: 'Khác',
    active: 'border-slate-200 bg-slate-100 text-slate-600',
  },
];

function CardForm({ deckId, deckName, deckLanguage, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const isEdit = Boolean(initialData);
  // Language is always locked to the deck's language
  const language = initialData?.language ?? deckLanguage;

  const form = useForm<CardFormData>({
    resolver: zodResolver(createCardSchema(language)),
    mode: 'all',
    defaultValues: initialData
      ? {
          deck_id: initialData.deck_id,
          language: initialData.language,
          word_type: initialData.word_type ?? '',
          front: initialData.front,
          pinyin: initialData.pinyin,
          meaning_vn: initialData.meaning_vn,
          meaning_en: initialData.meaning_en || '',
          examples: initialData.examples || [],
        }
      : {
          deck_id: deckId,
          language: deckLanguage,
          word_type: '',
          front: '',
          pinyin: '',
          meaning_vn: '',
          meaning_en: '',
          examples: [],
        },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = form;

  // Watch individual values so CardPreview re-renders on each keystroke
  // eslint-disable-next-line react-hooks/incompatible-library
  const front = watch('front');
  const pinyin = watch('pinyin');
  const meaningVn = watch('meaning_vn');
  const meaningEn = watch('meaning_en');
  const examples = watch('examples');

  const onSubmit = (data: CardFormData) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateCard(initialData!.id, data)
        : await createCard(data, difficulty);

      if (result.error) {
        toast.error(`❌ ${result.error}`);
        return;
      }

      if (isEdit) {
        toast.success('✅ Đã cập nhật thẻ thành công!');
        reset(data);
      } else {
        toast.success(`✅ Đã thêm thẻ mới vào ${deckName}!`);
        reset({
          deck_id: deckId,
          language: deckLanguage,
          word_type: '',
          front: '',
          pinyin: '',
          meaning_vn: '',
          meaning_en: '',
          examples: [],
        });
        setDifficulty('medium');
      }
    });
  };

  return (
    <div>
      {/* Page header */}
      <header className="mb-8 flex items-end justify-between">
        <div>
          <nav className="mb-3 flex items-center gap-1 text-xs font-medium text-slate-500">
            <Link
              href="/library"
              className="transition-colors hover:text-emerald-600"
            >
              Thư viện
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/library/${deckId}/cards`}
              className="transition-colors hover:text-emerald-600"
            >
              {deckName}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-emerald-600">
              {isEdit ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}
            </span>
          </nav>
          <div className="mb-1 flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            <h1 className="text-on-surface text-3xl font-black tracking-tight">
              {isEdit ? 'Chỉnh sửa thẻ học' : 'Tạo thẻ học mới'}
            </h1>
          </div>
          <p className="mt-1 text-slate-500">
            Hệ thống lặp lại ngắt quãng (SRS) sẽ giúp bạn ghi nhớ hiệu quả hơn.
          </p>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="hover:bg-surface-input text-slate-600"
            disabled={isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            form="card-form"
            disabled={isPending || !isDirty}
            className="bg-linear-to-br from-emerald-700 to-emerald-500 px-6 shadow-lg shadow-emerald-900/10 hover:opacity-90"
          >
            {isPending
              ? 'Đang lưu...'
              : isEdit
                ? 'Lưu thay đổi'
                : 'Lưu thẻ học'}
          </Button>
        </div>
      </header>

      <form id="card-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-12 gap-8">
          {/* Form side */}
          <div className="col-span-12 space-y-8 lg:col-span-7">
            {/* Section 1: Nội dung chi tiết */}
            <section className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-on-surface mb-6 flex items-center gap-2 text-lg font-bold">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                Nội dung chi tiết
              </h3>

              <div className="space-y-6">
                {/* Language badge (locked to deck) */}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-semibold text-emerald-700',
                      language === 'zh'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-blue-200 bg-blue-50 text-blue-700',
                    )}
                  >
                    {language === 'zh' ? '中文' : 'EN'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Ngôn ngữ được xác định theo bộ thẻ
                  </span>
                </div>

                {/* Front */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="front"
                    className="ml-1 block text-xs font-bold tracking-widest text-slate-400 uppercase"
                  >
                    {language === 'zh' ? 'Mặt trước (Chữ Hán)' : 'Từ vựng'}
                  </label>
                  <Input
                    id="front"
                    {...register('front')}
                    placeholder={
                      language === 'zh' ? 'Ví dụ: 学习' : 'vocabulary'
                    }
                    className="bg-surface-input rounded-xl border-0 px-4 py-3 text-lg font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                  />
                  {errors.front && (
                    <p className="ml-1 text-xs text-red-500">
                      {errors.front.message}
                    </p>
                  )}
                </div>

                {/* Pinyin — zh only */}
                {language === 'zh' && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="pinyin"
                      className="ml-1 block text-xs font-bold tracking-widest text-slate-400 uppercase"
                    >
                      Phiên âm (Pinyin)
                    </label>
                    <Input
                      id="pinyin"
                      {...register('pinyin')}
                      placeholder="xué xí"
                      className="bg-surface-input rounded-xl border-0 px-4 py-3 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                    />
                    {errors.pinyin && (
                      <p className="ml-1 text-xs text-red-500">
                        {errors.pinyin.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Meaning VN + EN */}
                <div
                  className={language === 'zh' ? 'grid grid-cols-2 gap-4' : ''}
                >
                  <div className="space-y-1.5">
                    <label
                      htmlFor="meaning_vn"
                      className="ml-1 block text-xs font-bold tracking-widest text-slate-400 uppercase"
                    >
                      Nghĩa tiếng Việt
                    </label>
                    <Input
                      id="meaning_vn"
                      {...register('meaning_vn')}
                      placeholder="Học tập"
                      className="bg-surface-input rounded-xl border-0 px-4 py-3 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                    />
                    {errors.meaning_vn && (
                      <p className="ml-1 text-xs text-red-500">
                        {errors.meaning_vn.message}
                      </p>
                    )}
                  </div>
                  {language === 'zh' && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="meaning_en"
                        className="ml-1 block text-xs font-bold tracking-widest text-slate-400 uppercase"
                      >
                        Nghĩa tiếng Anh{' '}
                        <span className="font-normal text-slate-400 normal-case">
                          (tùy chọn)
                        </span>
                      </label>
                      <Input
                        id="meaning_en"
                        {...register('meaning_en')}
                        placeholder="To study, learn"
                        className="bg-surface-input rounded-xl border-0 px-4 py-3 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                      />
                    </div>
                  )}
                </div>

                {/* Chinese meaning (EN cards only — stored in pinyin field) */}
                {language === 'en' && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="pinyin"
                      className="ml-1 block text-xs font-bold tracking-widest text-slate-400 uppercase"
                    >
                      Nghĩa tiếng Trung (tùy chọn)
                    </label>
                    <Input
                      id="pinyin"
                      {...register('pinyin')}
                      placeholder="学习"
                      className="bg-surface-input rounded-xl border-0 px-4 py-3 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                    />
                  </div>
                )}

                {/* Examples */}
                <ExampleList form={form} language={language} />
              </div>
            </section>

            {/* Section 2: Phân loại & Ghi chú */}
            <section className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-on-surface mb-6 flex items-center gap-2 text-lg font-bold">
                <Tag className="h-5 w-5 text-emerald-600" />
                Phân loại &amp; Ghi chú
              </h3>

              <div className="space-y-5">
                {/* Row 1: Deck + Word type */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="ml-1 block text-xs font-bold tracking-widest text-slate-400 uppercase">
                      Bộ sưu tập
                    </label>
                    <DeckSelector deckName={deckName} />
                    <input type="hidden" {...register('deck_id')} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="ml-1 block text-xs font-bold tracking-widest text-slate-400 uppercase">
                      Loại từ
                    </label>
                    <Controller
                      name="word_type"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-2 py-0.5">
                          {WORD_TYPES.map((t) => (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  field.value === t.value ? '' : t.value,
                                )
                              }
                              className={cn(
                                'cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
                                field.value === t.value
                                  ? t.active
                                  : 'bg-surface-input border-transparent text-slate-500 hover:bg-slate-200',
                              )}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Row 2: Difficulty / SRS info */}
                <div className="space-y-1.5">
                  <label className="ml-1 block text-xs font-bold tracking-widest text-slate-400 uppercase">
                    Độ khó ban đầu
                  </label>
                  {!isEdit ? (
                    <div className="flex gap-2">
                      {DIFFICULTY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDifficulty(opt.value)}
                          className={cn(
                            'flex-1 cursor-pointer rounded-lg border py-2.5 text-xs font-bold transition-all',
                            difficulty === opt.value
                              ? opt.value === 'easy'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : opt.value === 'medium'
                                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                                  : 'border-red-200 bg-red-50 text-red-700'
                              : 'bg-surface-input border-transparent text-slate-500 hover:bg-slate-100',
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 rounded-xl bg-blue-50 px-4 py-3">
                      <svg
                        className="h-4 w-4 shrink-0 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                      </svg>
                      <p className="text-xs font-medium text-blue-700">
                        Độ khó được FSRS tự động điều chỉnh theo lịch sử ôn tập
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Preview side — desktop only */}
          <div className="col-span-12 hidden lg:col-span-5 lg:block">
            <CardPreview
              front={front}
              pinyin={pinyin}
              meaningVn={meaningVn}
              meaningEn={meaningEn ?? ''}
              language={language}
              examples={examples ?? []}
            />
          </div>
        </div>
      </form>

      {/* Mobile sticky footer */}
      <div className="fixed bottom-0 left-0 z-40 flex w-full gap-3 border-t border-slate-100 bg-white/80 p-4 backdrop-blur-md lg:hidden">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          form="card-form"
          disabled={isPending || !isDirty}
          className="flex-2 bg-emerald-600 hover:bg-emerald-700"
        >
          {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Lưu thẻ'}
        </Button>
      </div>
    </div>
  );
}

export { CardForm };
