# Task 04: Cards List – Danh sách thẻ trong Deck

## 🎯 Mục tiêu

Xây dựng trang Chi tiết Deck hiển thị danh sách tất cả flashcard trong bộ thẻ, với header thống kê tổng quan, bảng tìm kiếm/sắp xếp, và điều hướng sang trang thêm/sửa thẻ.

---

## 📁 Các file đã tạo

| File                                             | Mô tả                                                                                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/(auth)/library/[deckId]/cards/page.tsx` | Server Component: load deck + flashcards, render header + table                                                                          |
| `src/components/cards/DeckDetailHeader.tsx`      | Header: 4 stats tiles + nút "Học ngay" + DeleteDeckDialog + back link                                                                    |
| `src/components/cards/FlashcardTable.tsx`        | Client Component: bảng thẻ với search + state filter + pagination (10/trang) + `ExampleCell` expand/collapse + delete dialog + edit link |
| `src/components/cards/MasteryBadge.tsx`          | Badge trạng thái FSRS: Mới / Đang học / Ôn tập / Học lại                                                                                 |

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
- **Nút "Ôn lại bộ này"**: link đến `/study/[deckId]?mode=review`, hiện khi `due_count === 0` và `card_count > 0`
- **DeleteDeckDialog**: xóa cascade, redirect về `/library`
- **Data type**: nhận `DeckDetail` (extends `Deck` + thêm `new_count`, `mastered_count`, `learning_count`)

> 💡 **Định nghĩa chuẩn FSRS state** (dùng nhất quán trên toàn app):
> | state | Label UI | Màu badge | Ý nghĩa |
> |-------|-------------|------------|------------------------------------------|
> | 0 | Mới | Blue | Chưa học lần nào |
> | 1 | Đang học | Orange | Đang trong giai đoạn học ngắn (phút/giờ) |
> | 2 | Đã thuộc | Emerald | Đã tốt nghiệp, khoảng lặp dài (ngày/tuần)|
> | 3 | Học lại | Red | Quên, đang học lại |
>
> `mastery_percent = state=2 cards / total × 100` — **Không dùng** `stability >= 21`.
> `due_count = next_review <= now` — bao gồm tất cả state, kể cả state=2 đến hạn.

### `FlashcardTable`

- **Columns (ZH)**: Chữ Hán | Phiên âm | Tiếng Việt | Tiếng Anh | Ví dụ | Loại từ | Trạng thái | Ôn tiếp | Lần cuối | Thao tác
- **Columns (EN)**: Từ vựng | Tiếng Việt | Tiếng Trung | Ví dụ | Loại từ | Trạng thái | Ôn tiếp | Lần cuối | Thao tác
- **Cột "Ví dụ"**: `ExampleCell` component — hiển thị 1 ví dụ mặc định, nút expand "+X ví dụ" / "Lẩn bớt"
- **Cột "Ôn tiếp"** dùng `dayjs`:
  - Quá hạn (diff < 0): lại `bg-red-100 text-red-600`, label "Quá hạn"
  - Hôm nay (diff = 0): `bg-orange-100 text-orange-600`, label "Hôm nay"
  - Ngày mai (diff = 1): `bg-amber-100 text-amber-600`, label "Ngày mai"
  - Tương lai: `bg-slate-100 text-slate-500`, label "X ngày"
- **Cột "Lần cuối"**: hiển thị `last_review` dạng tương đối ("Hôm nay", "Hôm qua", "X ngày trước")
- **Cột "Lịch sử"**: số lần ôn (reps) và số lần quên (lapses) từ `fsrs_data`
- **State filter**: dropdown [Tất cả / Đã thuộc / Đang học / Mới / Học lại]
- **Pagination**: 10 thẻ / trang, prev/next + số trang
- **Search**: filter theo `front`, `pinyin`, `meaning_vn` — realtime client-side
- **Sort**: mặc định sắp theo `next_review` tăng dần
- **Thao tác**: Pencil icon → link edit; Trash2 icon → confirmation dialog inline
- **Empty state riêng**: "Bộ thẻ chưa có thẻ nào" vs "Không tìm thấy thẻ phù hợp"

### `MasteryBadge`

```typescript
// Hiện tại trong src/components/cards/MasteryBadge.tsx
const STATE_MAP = {
  0: { label: 'Mới', className: 'bg-blue-500/10 text-blue-600' },
  1: { label: 'Đang học', className: 'bg-orange-500/10 text-orange-600' },
  2: { label: 'Đã thuộc', className: 'bg-emerald-500/10 text-emerald-600' },
  3: { label: 'Học lại', className: 'bg-red-500/10 text-red-600' },
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
- [x] Nút "Học ngay (N)" khi `due_count > 0`, "Ôn lại bộ này" khi `due_count === 0 && card_count > 0`
- [x] `DeleteDeckDialog` — xóa cascade, redirect về `/library`
- [x] 404 khi deck không tồn tại hoặc không thuộc user

### Bảng thẻ (FlashcardTable)

- [x] Hiển thị đủ columns theo ngôn ngữ (xem chi tiết phán trên)
- [x] `MasteryBadge` đúng màu theo FSRS state (0–3)
- [x] Cột "Ôn tiếp" dùng `dayjs` với màu tương đối
- [x] Cột "Lần cuối" dùng `dayjs` relative time
- [x] `ExampleCell` expand/collapse — 1 ví dụ mặc định, toggle hiển thị tất cả
- [x] `WordTypeBadge` (`src/components/cards/WordTypeBadge.tsx`) hiển thị loại từ (Danh từ/Động từ/Tính từ/Trạng từ/Khác) với màu tương ứng, „—“ khi không có
- [x] Tìm kiếm realtime theo `front`, `pinyin`, `meaning_vn`
- [x] State filter: dropdown các trạng thái FSRS
- [x] Pagination: 10 thẻ / trang
- [x] Icon sửa → `/library/[deckId]/cards/[cardId]/edit`
- [x] Icon xóa → confirmation dialog inline (không redirect)
- [x] Empty state phân biệt "chưa có thẻ" vs "không tìm thấy"

### General

- [x] Responsive: scroll ngang trên mobile (`overflow-x-auto`, `min-w-150`)
- [x] Server Component page, Client Component cho tương tác
- [x] Không có lỗi TypeScript
