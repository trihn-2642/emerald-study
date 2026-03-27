'use client';

import { Trash2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';

import type { CardFormData } from '@/lib/validations/card';

type Props = {
  index: number;
  form: UseFormReturn<CardFormData>;
  onRemove: () => void;
  language: 'zh' | 'en';
};

function ExampleItem({ index, form, onRemove, language }: Props) {
  const {
    register,
    formState: { errors },
  } = form;
  const exErrors = errors.examples?.[index];

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-4">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-3 right-3 cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
        aria-label="Xóa ví dụ"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="space-y-3 pr-8">
        {language === 'zh' ? (
          <>
            {/* Row 1: CN (required) + Pinyin (required) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-on-muted mb-1 block text-xs font-medium">
                  Tiếng Trung
                </label>
                <Input
                  {...register(`examples.${index}.cn`)}
                  placeholder="汉字..."
                />
                {exErrors?.cn && (
                  <p className="mt-1 text-xs text-red-500">
                    {exErrors.cn.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-on-muted mb-1 block text-xs font-medium">
                  Phiên âm
                </label>
                <Input
                  {...register(`examples.${index}.py`)}
                  placeholder="pīn yīn..."
                />
                {exErrors?.py && (
                  <p className="mt-1 text-xs text-red-500">
                    {exErrors.py.message}
                  </p>
                )}
              </div>
            </div>
            {/* Row 2: VN (required) + EN (optional) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-on-muted mb-1 block text-xs font-medium">
                  Tiếng Việt
                </label>
                <Input
                  {...register(`examples.${index}.vn`)}
                  placeholder="Nghĩa tiếng Việt..."
                />
                {exErrors?.vn && (
                  <p className="mt-1 text-xs text-red-500">
                    {exErrors.vn.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-on-muted mb-1 block text-xs font-medium">
                  Tiếng Anh{' '}
                  <span className="font-normal text-slate-400">(tùy chọn)</span>
                </label>
                <Input
                  {...register(`examples.${index}.en`)}
                  placeholder="English translation..."
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Row 1: EN full-width (required) */}
            <div>
              <label className="text-on-muted mb-1 block text-xs font-medium">
                Tiếng Anh
              </label>
              <Input
                {...register(`examples.${index}.en`)}
                placeholder="English sentence..."
              />
              {exErrors?.en && (
                <p className="mt-1 text-xs text-red-500">
                  {exErrors.en.message}
                </p>
              )}
            </div>
            {/* Row 2: VN (required) + CN (optional) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-on-muted mb-1 block text-xs font-medium">
                  Tiếng Việt
                </label>
                <Input
                  {...register(`examples.${index}.vn`)}
                  placeholder="Nghĩa tiếng Việt..."
                />
                {exErrors?.vn && (
                  <p className="mt-1 text-xs text-red-500">
                    {exErrors.vn.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-on-muted mb-1 block text-xs font-medium">
                  Tiếng Trung{' '}
                  <span className="font-normal text-slate-400">(tùy chọn)</span>
                </label>
                <Input
                  {...register(`examples.${index}.cn`)}
                  placeholder="汉字..."
                />
              </div>
            </div>
            <input type="hidden" {...register(`examples.${index}.py`)} />
          </>
        )}
      </div>
    </div>
  );
}

export { ExampleItem };
