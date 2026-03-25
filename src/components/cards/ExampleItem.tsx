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
        className="absolute top-3 right-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
        aria-label="Xóa ví dụ"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="grid grid-cols-1 gap-3 pr-8 sm:grid-cols-2">
        {language === 'zh' ? (
          <>
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
          </>
        ) : (
          <div className="sm:col-span-2">
            <label className="text-on-muted mb-1 block text-xs font-medium">
              Tiếng Anh
            </label>
            <Input
              {...register(`examples.${index}.en`)}
              placeholder="English sentence..."
            />
          </div>
        )}

        <div>
          <label className="text-on-muted mb-1 block text-xs font-medium">
            Tiếng Việt
          </label>
          <Input
            {...register(`examples.${index}.vn`)}
            placeholder="Nghĩa tiếng Việt..."
          />
          {exErrors?.vn && (
            <p className="mt-1 text-xs text-red-500">{exErrors.vn.message}</p>
          )}
        </div>

        {/* Hidden fields to ensure all 4 props are always registered */}
        {language === 'en' && (
          <input type="hidden" {...register(`examples.${index}.cn`)} />
        )}
        {language === 'en' && (
          <input type="hidden" {...register(`examples.${index}.py`)} />
        )}
        {language === 'zh' && (
          <input type="hidden" {...register(`examples.${index}.en`)} />
        )}
      </div>
    </div>
  );
}

export { ExampleItem };
