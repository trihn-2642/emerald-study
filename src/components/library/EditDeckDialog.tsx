'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import Loading from '@/app/loading';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { updateDeck } from '@/lib/data/library';
import { cn } from '@/lib/utils';

import type { Deck } from '@/types';

const deckSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên bộ thẻ không được để trống')
    .max(100, 'Tối đa 100 ký tự'),
  description: z.string().max(500, 'Tối đa 500 ký tự').optional(),
  language: z.enum(['zh', 'en'], { error: 'Vui lòng chọn ngôn ngữ' }),
});

type DeckFormData = z.infer<typeof deckSchema>;

type Props = {
  deck: Deck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function EditDeckDialog({ deck, open, onOpenChange }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      name: deck.name,
      description: deck.description ?? '',
      language: deck.language,
    },
  });

  // Sync when deck changes
  useEffect(() => {
    reset({
      name: deck.name,
      description: deck.description ?? '',
      language: deck.language,
    });
  }, [deck, reset]);

  function handleClose(nextOpen: boolean) {
    onOpenChange(nextOpen);
  }

  function onSubmit(data: DeckFormData) {
    startTransition(async () => {
      const result = await updateDeck(deck.id, data);
      if ('error' in result) {
        toast.error(`❌ ${result.error}`);
        return;
      }
      toast.success('✅ Đã cập nhật bộ thẻ!');
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <>
      {isPending && <Loading />}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bộ thẻ</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-on-surface text-sm font-medium">
                Tên bộ thẻ <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="Ví dụ: HSK 3 - Từ vựng cơ bản"
                aria-invalid={!!errors.name}
                className="aria-invalid:border-destructive"
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-on-surface text-sm font-medium">
                Mô tả{' '}
                <span className="text-on-muted text-xs font-normal">
                  (tùy chọn)
                </span>
              </label>
              <textarea
                {...register('description')}
                placeholder="Mô tả ngắn về bộ thẻ này..."
                rows={3}
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none"
              />
              {errors.description && (
                <p className="text-xs text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-on-surface text-sm font-medium">
                Ngôn ngữ <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="language"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { value: 'zh', label: 'Tiếng Trung', sub: '中文' },
                        { value: 'en', label: 'Tiếng Anh', sub: 'English' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          'flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                          field.value === opt.value
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-input text-on-muted hover:border-emerald-300',
                        )}
                      >
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-xs opacity-70">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.language && (
                <p className="text-xs text-red-600">
                  {errors.language.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { EditDeckDialog };
