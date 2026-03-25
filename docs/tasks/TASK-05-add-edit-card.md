# Task 05: Add/Edit Card – Thêm & Chỉnh sửa thẻ

## 🎯 Mục tiêu

Xây dựng form thêm thẻ mới và chỉnh sửa thẻ hiện có, bao gồm: preview thẻ realtime, quản lý ví dụ động, tích hợp Toast notification, và xử lý lỗi form đầy đủ.

---

## 📁 Các file cần tạo / sửa

### Tạo mới

| File                                                           | Mô tả                                                                                   |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/app/(auth)/library/[deckId]/cards/new/page.tsx`           | Trang thêm thẻ mới (nested dưới deck)                                                   |
| `src/app/(auth)/library/[deckId]/cards/[cardId]/edit/page.tsx` | Server Component: load card data để edit                                                |
| `src/components/cards/CardForm.tsx`                            | Form chính (Client Component): dùng chung cho Add & Edit                                |
| `src/components/cards/CardPreview.tsx`                         | Preview thẻ realtime bên phải form                                                      |
| `src/components/cards/ExampleList.tsx`                         | Danh sách ví dụ động: thêm/xóa example                                                  |
| `src/components/cards/ExampleItem.tsx`                         | 1 example với 4 fields: cn, py, vn, en                                                  |
| `src/components/cards/DeckSelector.tsx`                        | Hiển thị deck hiện tại (locked theo URL context)                                        |
| `src/components/cards/LanguageToggle.tsx`                      | Toggle chọn ngôn ngữ: Tiếng Trung / Tiếng Anh                                           |
| `src/components/cards/DeleteCardButton.tsx`                    | Nút xóa thẻ có confirm (dùng trong edit page)                                           |
| `src/lib/data/cards.ts`                                        | Data fetching + Server Actions: `getCardById`, `createCard`, `updateCard`, `deleteCard` |
| `src/lib/data/cards.ts`                                        | Fetch single card by ID cho edit page                                                   |
| `src/lib/validations/card.ts`                                  | Zod schema `cardSchema` cho form validation                                             |

---

## 🏗️ Chi tiết kỹ thuật

### Layout Add/Edit Card (theo UI design)

```
┌─────────────────────┬───────────────────┐
│ FORM                │ PREVIEW           │
│                     │                   │
│ Ngôn ngữ: [中][EN]  │  ┌─────────────┐  │
│                     │  │             │  │
│ Bộ thẻ: [HSK 1-3 ▼] │  │    学习     │  │
│                     │  │             │  │
│ Mặt trước:          │  └─────────────┘  │
│ [学习____________]  │  (click to flip)  │
│                     │                   │
│ Pinyin:             │  ┌─────────────┐  │
│ [xué xí___________] │  │ xué xí      │  │
│                     │  │ Học tập     │  │
│ Nghĩa (Việt):       │  │ To study    │  │
│ [Học tập__________] │  └─────────────┘  │
│                     │                   │
│ Nghĩa (Anh):        │                   │
│ [To study_________] │                   │
│                     │                   │
│ Ví dụ: [+ Thêm]     │                   │
│ [cn][py][vn][en] 🗑️ │                   │
│                     │                   │
│      [Huỷ] [Lưu thẻ]│                   │
└─────────────────────┴───────────────────┘
```

### `src/lib/validations/card.ts` – Zod Schema

```typescript
import { z } from 'zod';

export const exampleSchema = z.object({
  cn: z.string().min(1, 'Không được để trống'),
  py: z.string().min(1, 'Không được để trống'),
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

export const deckSchema = z.object({
  name: z.string().min(1, 'Tên bộ thẻ không được để trống').max(100),
  description: z.string().max(500).optional(),
  language: z.enum(['zh', 'en'], { message: 'Vui lòng chọn ngôn ngữ' }),
});

export type CardFormData = z.infer<typeof cardSchema>;
export type DeckFormData = z.infer<typeof deckSchema>;
```

### `CardForm` – Form Fields

```typescript
interface CardFormData {
  deck_id: string;
  language: 'zh' | 'en';
  front: string; // required
  pinyin: string; // required if language === 'zh'
  meaning_vn: string; // required
  meaning_en: string; // optional
  examples: Example[]; // optional, max 5
}
```

### Validation Rules

```typescript
// front: required, min 1 char, max 50 chars
// pinyin: required nếu language === 'zh'
// meaning_vn: required, min 1 char, max 200 chars
// meaning_en: optional, max 200 chars
// examples: mỗi example cần ít nhất cn + vn, hoặc en + vn
// deck_id: required
```

### Server Actions (`src/lib/data/cards.ts`)

```typescript
'use server';

export async function createCard(formData: CardFormData): Promise<ActionResult>;
export async function updateCard(
  id: string,
  formData: CardFormData,
): Promise<ActionResult>;
export async function deleteCard(id: string): Promise<ActionResult>;

interface ActionResult {
  success: boolean;
  error?: string;
  cardId?: string;
}
```

### Toast Notifications (Shadcn Sonner)

```typescript
// Thành công khi tạo:    "✅ Đã thêm thẻ mới vào [tên deck]!"
// Thành công khi sửa:    "✅ Đã cập nhật thẻ thành công!"
// Thành công khi xóa:    "🗑️ Đã xóa thẻ."
// Lỗi kết nối:           "❌ Không thể lưu thẻ. Vui lòng thử lại."
// Lỗi validation:        Hiển thị inline dưới mỗi field
```

### `CardPreview` – Realtime Preview

- Subscribe vào form state qua `watch()` (React Hook Form)
- Render `FlashcardView` thu nhỏ (scale 0.8) với data hiện tại
- Preview cũng có thể flip để xem mặt trước/sau

### `ExampleList` – Dynamic Fields

```typescript
// Dùng useFieldArray từ React Hook Form
// Tối đa 5 examples
// Nút "+ Thêm ví dụ" disable khi đạt 5
// Nút xóa (🗑️) trên mỗi example
```

---

## ✅ Checklist hoàn thành

### CardForm – Fields & Validation

- [x] `LanguageToggle` chuyển đổi giữa 中文 và EN
- [x] Khi chọn EN: ẩn field Pinyin, label "Mặt trước" đổi thành "Từ vựng"
- [x] `DeckSelector` hiển thị tên deck hiện tại (locked theo URL, không dropdown)
- [ ] `DeckSelector` có option "＋ Tạo bộ thẻ mới" mở dialog inline
- [x] Tất cả required fields có validation error message bằng tiếng Việt
- [x] Form reset sau khi lưu thành công (chế độ Add)
- [x] Form giữ nguyên data khi có lỗi server

### CardPreview

- [x] Preview cập nhật realtime khi user gõ vào form
- [x] Preview hiển thị đúng layout mặt trước và mặt sau
- [x] Preview ẩn trên mobile
- [x] Preview có thể click để flip

### ExampleList

- [x] Thêm example mới với 4 fields trống
- [ ] Xóa example (có confirm nếu đã có dữ liệu)
- [x] Validation: `vn` là required
- [x] Giới hạn tối đa 5 examples, disable nút thêm khi đủ

### Server Actions

- [x] `createCard` insert vào Supabase, khởi tạo `fsrs_data` mặc định (state=0)
- [x] `createCard` set `next_review = now()` (due ngay)
- [x] `updateCard` chỉ update content fields, không reset `fsrs_data`
- [x] `deleteCard` xóa card khỏi Supabase
- [x] Xử lý lỗi Supabase và trả về `ActionResult` phù hợp

### Toast & Error Handling

- [x] Toast "thành công" xuất hiện sau khi lưu thẻ
- [x] Toast "thất bại" xuất hiện khi có lỗi server
- [ ] Toast tự động dismiss sau 3 giây
- [ ] Inline error dưới mỗi field khi validation fail

### Edit Card

- [x] Trang edit load đúng data của card hiện tại
- [x] Edit không thể đổi `deck_id` (locked theo URL context)
- [x] Nút "Xóa thẻ" có confirmation (`confirm()`) trước khi xóa
- [x] Sau khi xóa: redirect về `/library/[deckId]`

### General

- [ ] Form submit khi nhấn Enter (nếu không có multiline field đang focus)
- [x] Nút "Huỷ" navigate back
- [x] Breadcrumb: "← Tên Deck" back link
- [x] Không có lỗi TypeScript
- [x] Responsive trên mobile: form full-width, preview ẩn
