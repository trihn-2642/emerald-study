'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { CardPreview } from '@/components/cards/CardPreview';
import { DeckSelector } from '@/components/cards/DeckSelector';
import { ExampleList } from '@/components/cards/ExampleList';
import { LanguageToggle } from '@/components/cards/LanguageToggle';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { createCard, updateCard } from '@/lib/data/cards';
import { cardSchema } from '@/lib/validations/card';

import type { CardFormData } from '@/lib/validations/card';
import type { Flashcard } from '@/types';

type Props = {
  deckId: string;
  deckName: string;
  initialData?: Flashcard;
};

function CardForm({ deckId, deckName, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(initialData);

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: initialData
      ? {
          deck_id: initialData.deck_id,
          language: initialData.language,
          front: initialData.front,
          pinyin: initialData.pinyin,
          meaning_vn: initialData.meaning_vn,
          meaning_en: initialData.meaning_en || '',
          examples: initialData.examples || [],
        }
      : {
          deck_id: deckId,
          language: 'zh',
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
    setValue,
    reset,
    formState: { errors, isDirty },
  } = form;

  // eslint-disable-next-line react-hooks/incompatible-library
  const language = watch('language');

  const onSubmit = (data: CardFormData) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateCard(initialData!.id, data)
        : await createCard(data);

      if (result.error) {
        toast.error(`❌ ${result.error}`);
        return;
      }

      if (isEdit) {
        toast.success('✅ Đã cập nhật thẻ thành công!');
      } else {
        toast.success(`✅ Đã thêm thẻ mới vào ${deckName}!`);
        reset({
          deck_id: deckId,
          language,
          front: '',
          pinyin: '',
          meaning_vn: '',
          meaning_en: '',
          examples: [],
        });
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-8 lg:grid-cols-[1fr_360px]"
    >
      {/* Left: Form fields */}
      <div className="space-y-5">
        {/* Language toggle */}
        <div>
          <p className="text-on-surface mb-2 text-sm font-medium">Ngôn ngữ</p>
          <LanguageToggle
            value={language}
            onChange={(l) => setValue('language', l, { shouldValidate: false })}
          />
        </div>

        {/* Deck (locked to URL context) */}
        <div>
          <p className="text-on-surface mb-2 text-sm font-medium">Bộ thẻ</p>
          <DeckSelector deckName={deckName} />
          <input type="hidden" {...register('deck_id')} />
        </div>

        {/* Front */}
        <FormField
          label={language === 'zh' ? 'Mặt trước' : 'Từ vựng'}
          htmlFor="front"
          error={errors.front?.message}
        >
          <Input
            id="front"
            {...register('front')}
            placeholder={language === 'zh' ? '学习' : 'vocabulary'}
          />
        </FormField>

        {/* Pinyin — zh only */}
        {language === 'zh' && (
          <FormField
            label="Pinyin"
            htmlFor="pinyin"
            error={errors.pinyin?.message}
          >
            <Input id="pinyin" {...register('pinyin')} placeholder="xué xí" />
          </FormField>
        )}

        {/* Meaning VN */}
        <FormField
          label="Nghĩa (Tiếng Việt)"
          htmlFor="meaning_vn"
          error={errors.meaning_vn?.message}
        >
          <Input
            id="meaning_vn"
            {...register('meaning_vn')}
            placeholder="Học tập"
          />
        </FormField>

        {/* Meaning EN */}
        <FormField
          label="Nghĩa (Tiếng Anh)"
          htmlFor="meaning_en"
          error={errors.meaning_en?.message}
        >
          <Input
            id="meaning_en"
            {...register('meaning_en')}
            placeholder="To study"
          />
        </FormField>

        {/* Examples */}
        <ExampleList form={form} language={language} />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending || !isDirty}
          >
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={isPending || !isDirty}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Lưu thẻ'}
          </Button>
        </div>
      </div>

      {/* Right: Preview — desktop only */}
      <div className="hidden lg:block">
        <CardPreview form={form} />
      </div>
    </form>
  );
}

export { CardForm };
