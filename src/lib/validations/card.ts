import { z } from 'zod';

export const exampleSchema = z.object({
  cn: z.string(),
  py: z.string(),
  vn: z.string().min(1, 'Không được để trống'),
  en: z.string(),
});

export const cardSchema = z
  .object({
    deck_id: z.string().uuid('Vui lòng chọn bộ thẻ'),
    language: z.enum(['zh', 'en']),
    front: z.string().min(1, 'Không được để trống').max(50, 'Tối đa 50 ký tự'),
    pinyin: z.string(),
    meaning_vn: z
      .string()
      .min(1, 'Không được để trống')
      .max(200, 'Tối đa 200 ký tự'),
    meaning_en: z.string().max(200, 'Tối đa 200 ký tự').optional(),
    examples: z.array(exampleSchema).max(5, 'Tối đa 5 ví dụ'),
  })
  .refine((data) => data.language !== 'zh' || data.pinyin.length > 0, {
    message: 'Pinyin không được để trống khi ngôn ngữ là Tiếng Trung',
    path: ['pinyin'],
  });

export type CardFormData = z.infer<typeof cardSchema>;
