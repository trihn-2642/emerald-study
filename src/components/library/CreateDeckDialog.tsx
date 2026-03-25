'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createDeck } from '@/lib/data/library';
import { cn } from '@/lib/utils';

const deckSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên bộ thẻ không được để trống')
    .max(100, 'Tối đa 100 ký tự'),
  description: z.string().max(500, 'Tối đa 500 ký tự').optional(),
  language: z.enum(['zh', 'en'], {
    error: 'Vui lòng chọn ngôn ngữ',
  }),
});

type DeckFormData = z.infer<typeof deckSchema>;

export type { DeckFormData };

type Props = {
  label?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOptimisticCreate?: (data: DeckFormData) => void;
};

function CreateDeckDialog({
  label,
  open,
  onOpenChange,
  onOptimisticCreate,
}: Props) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: { language: 'zh' },
  });

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
    }
    setIsOpen(nextOpen);
  }

  function onSubmit(data: DeckFormData) {
    startTransition(async () => {
      onOptimisticCreate?.(data);
      const result = await createDeck(data);
      if ('error' in result) {
        toast.error(`❌ ${result.error}`);
        return;
      }
      toast.success('✅ Đã tạo bộ thẻ mới!');
      reset();
      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      {isPending && <Loading />}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        {!isControlled && (
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              {label ?? 'Tạo bộ thẻ mới'}
            </button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo bộ thẻ mới</DialogTitle>
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
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring aria-invalid:border-destructive w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none"
                aria-invalid={!!errors.description}
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
                    ).map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => field.onChange(lang.value)}
                        className={cn(
                          'rounded-xl border-2 px-4 py-3 text-left transition-all',
                          field.value === lang.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-outline-variant hover:border-emerald-300',
                        )}
                      >
                        <p className="text-on-surface text-sm font-semibold">
                          {lang.label}
                        </p>
                        <p className="text-on-muted text-xs">{lang.sub}</p>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Đang tạo...' : 'Tạo bộ thẻ'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { CreateDeckDialog };
