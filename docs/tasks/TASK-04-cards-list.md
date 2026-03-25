# Task 04: Cards List – Danh sách thẻ trong Deck

## 🎯 Mục tiêu

Xây dựng trang Chi tiết Deck hiển thị danh sách tất cả flashcard trong bộ thẻ, với header thống kê tổng quan, bảng tìm kiếm/sắp xếp, và điều hướng sang trang thêm/sửa thẻ.

---

## 📁 Các file đã tạo

| File                                             | Mô tả                                                                 |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| `src/app/(auth)/library/[deckId]/cards/page.tsx` | Server Component: load deck + flashcards, render header + table       |
| `src/components/library/DeckDetailHeader.tsx`    | Header: 4 stats tiles + nút "Học ngay" + DeleteDeckDialog + back link |
| `src/components/library/FlashcardTable.tsx`      | Client Component: bảng thẻ với search + sort + link chỉnh sửa         |
| `src/components/library/MasteryBadge.tsx`        | Badge trạng thái FSRS: Mới / Đang học / Ôn tập / Học lại              |

---

## 🏗️ Chi tiết kỹ thuật

### Layout Cards List Page

```
┌─────────────────────────────────────────────┐
│ ← Thư viện                        [Xóa deck]│
│ 📗 Hán tự HSK 1-3  [CN]  [Học ngay (6)]    │
│ Mô tả deck (nếu có)                         │
├──────────┬──────────┬──────────┬────────────┤
│ Tổng thẻ │ Cần ôn   │ Thẻ mới  │ Thuộc lòng │
│    7     │    6     │    2     │   57%      │
├─────────────────────────────────────────────┤
│ [🔍 Tìm thẻ...]        [Ngày ôn ▼] [+ Thêm]│
├──────┬────────┬──────────────┬───────┬──────┤
│ Từ   │ Phiên âm│ Nghĩa TV   │Trạng  │ Ôn   │ Sửa│
├──────┼────────┼──────────────┼───────┼──────┤
│ 学习 │ xué xí │ Học tập      │ Đang học│Hôm nay│ ✏️ │
│ 工作 │gōng zuò│ Làm việc    │ Ôn tập │7 ngày │ ✏️ │
└──────┴────────┴──────────────┴───────┴──────┘
```

### `DeckDetailHeader`

- **Back link**: `← Thư viện` → `/library`
- **4 stats tiles**: Tổng thẻ / Cần ôn / Thẻ mới / Thuộc lòng (mastery%)
- **Language badge**: hiển thị từ `LANGUAGE_LABELS[language]`
- **Nút "Học ngay (N)"**: link đến `/study/[deckId]`, chỉ hiện khi `due_count > 0`
- **Nút "Xem thẻ"**: link đến `/study/[deckId]`, hiện khi `due_count === 0`
- **DeleteDeckDialog**: xóa cascade, redirect về `/library`
- **Data type**: nhận `DeckDetail` (extends `Deck` + thêm `new_count`)

### `FlashcardTable`

```typescript
type SortValue = 'next_review' | 'front' | 'state';

const SORTS = [
  { value: 'next_review', label: 'Ngày ôn' },
  { value: 'front', label: 'Từ A-Z' },
  { value: 'state', label: 'Trạng thái' },
];
```

- **Columns**: Từ/Cụm từ | Phiên âm | Nghĩa tiếng Việt | Trạng thái | Ôn tiếp | Sửa
- **Cột "Ôn tiếp"** dùng `dayjs`: Quá hạn (đỏ) / Hôm nay (cam) / Ngày mai (vàng) / X ngày (muted)
- **Cột "Sửa"**: icon `Pencil` → link `/library/[deckId]/cards/[cardId]/edit`
- **Nút "+ Thêm thẻ"**: link `/library/[deckId]/cards/new`
- **Search**: filter theo `front`, `pinyin`, `meaning_vn` — realtime client-side
- **Sort**: thực hiện client-side trên mảng đã filter
- **Count**: hiển thị `X / Y thẻ` (filtered / total)
- **Empty state riêng**: "Bộ thẻ chưa có thẻ nào" vs "Không tìm thấy thẻ phù hợp"

### `MasteryBadge`

```typescript
const STATE_MAP = {
  0: { label: 'Mới', className: 'bg-slate-100 text-slate-600' },
  1: { label: 'Đang học', className: 'bg-amber-100 text-amber-700' },
  2: { label: 'Ôn tập', className: 'bg-blue-100  text-blue-700' },
  3: { label: 'Học lại', className: 'bg-red-100   text-red-700' },
};
```

### Routing

- Route: `/library/[deckId]/cards`
- `page.tsx` fetch song song `getDeckById` + `getFlashcardsByDeck` bằng `Promise.all`
- `notFound()` khi deck không tồn tại hoặc không thuộc user

---

## ✅ Checklist hoàn thành

### Header

- [x] Back button "← Thư viện" → `/library`
- [x] Tên deck + language badge
- [x] 4 stats tiles: Tổng thẻ / Cần ôn / Thẻ mới / Thuộc lòng
- [x] Nút "Học ngay (N)" khi `due_count > 0`, "Xem thẻ" khi `due_count === 0`
- [x] `DeleteDeckDialog` — xóa cascade, redirect về `/library`
- [x] 404 khi deck không tồn tại hoặc không thuộc user

### Bảng thẻ (FlashcardTable)

- [x] Hiển thị đủ columns: Từ, Phiên âm, Nghĩa TV, Trạng thái, Ôn tiếp, Sửa
- [x] `MasteryBadge` đúng màu theo FSRS state (0–3)
- [x] Cột "Ôn tiếp" dùng `dayjs` với màu tương đối
- [x] Tìm kiếm realtime theo `front`, `pinyin`, `meaning_vn`
- [x] Sort: Ngày ôn / Từ A-Z / Trạng thái
- [x] Count hiển thị filtered / total
- [x] Icon sửa → `/library/[deckId]/cards/[cardId]/edit`
- [x] Nút "+ Thêm thẻ" → `/library/[deckId]/cards/new`
- [x] Empty state phân biệt "chưa có thẻ" vs "không tìm thấy"

### General

- [x] Responsive: scroll ngang trên mobile (`overflow-x-auto`, `min-w-150`)
- [x] Server Component page, Client Component cho tương tác
- [x] Không có lỗi TypeScript
