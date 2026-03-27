# Task 05: Add/Edit Card – Thêm & Chỉnh sửa thẻ

## 🎯 Mục tiêu

Xây dựng form thêm thẻ mới và chỉnh sửa thẻ hiện có, bao gồm: preview thẻ realtime, quản lý ví dụ động, tích hợp Toast notification, và xử lý lỗi form đầy đủ.

> **Ghi chú DB migration cần thiết:**
> Thêm cột `word_type text` vào bảng `flashcards` trong Supabase:
>
> ```sql
> ALTER TABLE flashcards ADD COLUMN word_type text;
> ```

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

// Dynamic per-language example schemas
const exampleZhSchema = z.object({
  cn: z.string().min(1, 'Không được để trống'), // required for ZH
  py: z.string(),
  vn: z.string(),
  en: z.string(),
});

const exampleEnSchema = z.object({
  cn: z.string(),
  py: z.string(),
  vn: z.string(),
  en: z.string().min(1, 'Không được để trống'), // required for EN
});

// Single factory function — returns schema appropriate for the language
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

// Static export kept for TypeScript type inference only
export const cardSchema = createCardSchema('zh');
export type CardFormData = z.infer<typeof cardSchema>;

export const deckSchema = z.object({
  name: z.string().min(1, 'Tên bộ thẻ không được để trống').max(100),
  description: z.string().max(500).optional(),
  language: z.enum(['zh', 'en'], { message: 'Vui lòng chọn ngôn ngữ' }),
});
export type DeckFormData = z.infer<typeof deckSchema>;
```

### `CardForm` – Form Fields

```typescript
interface CardFormData {
  deck_id: string;
  language: 'zh' | 'en';
  word_type?: string; // optional: noun/verb/adj/adv/exclamation
  front: string; // required
  pinyin: string; // required if language === 'zh'; for EN stores Chinese equivalent
  meaning_vn: string; // required
  meaning_en?: string; // optional
  examples: Example[]; // optional, max 5
}
```

### `ExampleItem` – Layout theo ngôn ngữ

- **ZH** (2x2 grid):
  - Row 1: Tiếng Trung (required) | Phiên âm (required)
  - Row 2: Tiếng Việt (required) | Tiếng Anh (tùy chọn)
- **EN** (full-width + 2-col):
  - Row 1: Tiếng Anh full-width (required)
  - Row 2: Tiếng Việt (required) | Tiếng Trung (tùy chọn)
  - Field `py` ẩn (không hiển thị cho EN examples)

### Server Actions (`src/lib/data/cards.ts`)

```typescript
'use server';

// createCard nhận thêm param `difficulty` để khởi tạo FSRS difficulty ban đầu
export async function createCard(
  formData: CardFormData,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
): Promise<ActionResult>;

export async function updateCard(
  id: string,
  formData: CardFormData,
): Promise<ActionResult>;

export async function deleteCard(
  id: string,
  deckId: string, // cần dùng để revalidatePath
): Promise<ActionResult>;

interface ActionResult {
  success?: boolean;
  error?: string;
  cardId?: string;
}

// DIFFICULTY_MAP maps difficulty selector → FSRS initial difficulty value
const DIFFICULTY_MAP = { easy: 3.0, medium: 5.3, hard: 7.5 };
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
- [x] Tất cả required fields có validation error message bằng tiếng Việt
- [x] Form reset sau khi lưu thành công (chế độ Add)
- [x] Form giữ nguyên data khi có lỗi server
- [x] **Word type chip**: chọn loại từ (Danh từ / Động từ / Tính từ / Trạng từ / Thán từ) — color-coded, toggle on/off
- [x] **Độ khó ban đầu**: selector Dễ/Trung bình/Khó (chỉ hiển thị khi tạo mới, edit mode dùng FSRS tự động)
- [x] `mode: 'all'`, `reValidateMode: 'onChange'` để validate realtime
- [x] `createCardSchema(language)` dynamic resolver theo ngôn ngữ hiện tại

### CardPreview

- [x] Preview cập nhật realtime khi user gõ vào form
- [x] Preview hiển thị đúng layout mặt trước và mặt sau
- [x] Preview ẩn trên mobile, hiển thị từ `lg` trở lên
- [x] Preview có thể click để flip (3D CSS `rotateY`, không dùng Framer Motion)
- [x] Icon 🔊 trên mặt trước đọc từ vựng bằng Web Speech API (không lật thẻ)
- [x] Icon 🔊 trên mỗi ví dụ (mặt sau) đọc câu ví dụ bằng Web Speech API (không lật thẻ)

### ExampleList

- [x] Thêm example mới với các fields trống
- [x] Xóa example không cần confirm
- [x] ZH: `cn`, `py`, `vn` required; `en` optional
- [x] EN: `en`, `vn` required; `cn` optional; field `py` ẩn
- [x] Giới hạn tối đa 5 examples, disable nút thêm khi đủ

### Server Actions

- [x] `createCard` insert vào Supabase, khởi tạo `fsrs_data` mặc định (state=0)
- [x] `createCard` set `next_review = now()` (due ngay)
- [x] `createCard` nhận param `difficulty` để điều chỉnh `fsrs_data.difficulty` ban đầu
- [x] `updateCard` chỉ update content fields, không reset `fsrs_data`
- [x] `deleteCard` nhận `deckId` để `revalidatePath` đúng
- [x] Xử lý lỗi Supabase và trả về `ActionResult` phù hợp

### Toast & Error Handling

- [x] Toast "thành công" xuất hiện sau khi lưu thẻ
- [x] Toast "thất bại" xuất hiện khi có lỗi server
- [x] Inline error dưới field khi validation fail (RHF `mode: 'all'`)
- [x] Toast xóa thẻ "🗑️ Đã xóa thẻ." (từ FlashcardTable) và toast xóa từ edit page

### Edit Card

- [x] Trang edit load đúng data của card hiện tại
- [x] Edit không thể đổi `deck_id` (locked theo URL context)
- [x] Nút "Xóa thẻ" có confirmation dialog trước khi xóa
- [x] Sau khi xóa: redirect về `/library/[deckId]/cards`
- [x] Ḷ chế độ edit: ẩn difficulty selector, hiển thị thông báo FSRS tự động điều chỉnh

### General

- [x] Nút "Huỷ" navigate back
- [x] Breadcrumb: "← Tên Deck" back link
- [x] Không có lỗi TypeScript
- [x] Responsive trên mobile: form full-width, preview ẩn

---

## ⚠️ Pending / To-do

- [ ] `word_type` chưa được lưu lên DB (cần chạy migration `ALTER TABLE flashcards ADD COLUMN word_type text` và thêm vào insert/update trong `cards.ts`)
- [ ] `DeckSelector` chưa có option "＋ Tạo bộ thẻ mới" inline
