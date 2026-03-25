'use client';

import { Plus } from 'lucide-react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';

import { ExampleItem } from '@/components/cards/ExampleItem';
import { Button } from '@/components/ui/button';

import type { CardFormData } from '@/lib/validations/card';

type Props = {
  form: UseFormReturn<CardFormData>;
  language: 'zh' | 'en';
};

function ExampleList({ form, language }: Props) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'examples',
  });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-on-surface text-sm font-medium">
          Ví dụ{' '}
          <span className="text-on-muted font-normal">({fields.length}/5)</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ cn: '', py: '', vn: '', en: '' })}
          disabled={fields.length >= 5}
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm ví dụ
        </Button>
      </div>

      {fields.length > 0 ? (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <ExampleItem
              key={field.id}
              index={index}
              form={form}
              language={language}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center">
          <p className="text-on-muted text-sm">
            Chưa có ví dụ nào. Thêm ví dụ để học tốt hơn.
          </p>
        </div>
      )}
    </div>
  );
}

export { ExampleList };
