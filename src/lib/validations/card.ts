import { z } from 'zod';

const exampleZhSchema = z.object({
  cn: z.string().min(1, 'Không được để trống'),
  py: z.string().min(1, 'Không được để trống'),
  vn: z.string().min(1, 'Không được để trống'),
  en: z.string(),
});

const exampleEnSchema = z.object({
  cn: z.string(),
  py: z.string(),
  vn: z.string().min(1, 'Không được để trống'),
  en: z.string().min(1, 'Không được để trống'),
});

export function createCardSchema(language: 'zh' | 'en') {
  return z
    .object({
      deck_id: z.string().uuid('Vui lòng chọn bộ thẻ'),
      language: z.enum(['zh', 'en']),
      word_type: z.string().optional(),
      front: z
        .string()
        .min(1, 'Không được để trống')
        .max(50, 'Tối đa 50 ký tự'),
      pinyin: z.string(),
      meaning_vn: z
        .string()
        .min(1, 'Không được để trống')
        .max(200, 'Tối đa 200 ký tự'),
      meaning_en: z.string().max(200, 'Tối đa 200 ký tự').optional(),
      examples: z
        .array(language === 'zh' ? exampleZhSchema : exampleEnSchema)
        .max(5, 'Tối đa 5 ví dụ'),
    })
    .refine((data) => language !== 'zh' || data.pinyin.length > 0, {
      message: 'Pinyin không được để trống khi ngôn ngữ là Tiếng Trung',
      path: ['pinyin'],
    });
}

// Keep static export for type inference
export const cardSchema = createCardSchema('zh');

export const deckSchema = z.object({
  name: z.string().min(1, 'Tên bộ thẻ không được để trống').max(100),
  description: z.string().max(500).optional(),
  language: z.enum(['zh', 'en'], { message: 'Vui lòng chọn ngôn ngữ' }),
});

export type CardFormData = z.infer<typeof cardSchema>;
export type DeckFormData = z.infer<typeof deckSchema>;
