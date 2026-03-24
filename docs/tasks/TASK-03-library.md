# Task 03: Library – Thư viện & Chi tiết bộ thẻ

## 🎯 Mục tiêu

Xây dựng trang Thư viện để xem tất cả bộ thẻ, tìm kiếm/lọc/sắp xếp flashcard, và trang Chi tiết bộ thẻ (Deck Detail) hiển thị danh sách thẻ dạng bảng với thông tin FSRS.

---

## 📁 Các file cần tạo / sửa

### Tạo mới

| File                                          | Mô tả                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/app/(unth)/library/page.tsx`             | Server Component: trang thư viện, danh sách decks                             |
| `src/app/(unth)/library/[deckId]/page.tsx`    | Server Component: Chi tiết 1 deck, danh sách thẻ                              |
| `src/components/library/DeckListHeader.tsx`   | Header có tiêu đề + nút "⬇ Tạo bộ thẻ mới" mở dialog                          |
| `src/components/library/CreateDeckDialog.tsx` | Dialog tạo deck mới: trường tên, mô tả, ngôn ngữ (zh/en)                      |
| `src/components/library/DeleteDeckDialog.tsx` | Dialog xác nhận xóa deck và cảnh báo xoá cascade thẻ                          |
| `src/components/library/DeckListGrid.tsx`     | Grid tất cả decks với filter ngôn ngữ                                         |
| `src/components/library/LibraryDeckCard.tsx`  | Card deck trong thư viện: tên, mô tả, stats, language badge                   |
| `src/components/library/SearchAndFilter.tsx`  | Thanh tìm kiếm + Chip filter [Tất cả, Tiếng Trung, Tiếng Anh] + Sort dropdown |
| `src/components/library/FlashcardTable.tsx`   | Bảng danh sách thẻ trong deck (Client Component cho sort/search)              |
| `src/components/library/FlashcardRow.tsx`     | Hàng trong bảng: front, pinyin, meaning_vn, state badge, next_review, actions |
| `src/components/library/DeckDetailHeader.tsx` | Header deck detail: tên deck, stats tổng quan (tổng thẻ, due, mastery%)       |
| `src/components/library/MasteryBadge.tsx`     | Badge hiển thị trạng thái FSRS: Mới/Đang học/Ôn tập/Thuộc lòng                |
| `src/lib/data/library.ts`                     | Server-side data fetching cho Library                                         |

---

## 🏗️ Chi tiết kỹ thuật

### Layout Library Page

```
┌─────────────────────────────────────────────┐
│ Thư viện của bạn          [+ Tạo bộ thẻ mới]│
├─────────────────────────────────────────────┤
│ [🔍 Tìm kiếm...] [Tất cả][Tiếng Trung][Anh] │
├──────────┬──────────┬──────────┬────────────┤
│ HSK 1-3  │ Business │ Vocab Pro│ Grammar    │
│ 中文 🔵  │ EN 🟢    │ EN 🟢   │ 中文 🔵   │
│ 240 thẻ  │ 85 thẻ   │ 120 thẻ │ 60 thẻ    │
│ 54 đến hạn│ 0 đến hạn│12 đến hạn│ 3 đến hạn │
│ [Học ngay]│[Xem thẻ] │[Học ngay]│[Học ngay] │
└──────────┴──────────┴──────────┴────────────┘
```

### Layout Deck Detail Page

```
┌─────────────────────────────────────────────┐
│ ← Hán tự HSK 1-3                            │
│ 84 thẻ  |  22 đến hạn  |  18 mới  |  70% 📊│
├─────────────────────────────────────────────┤
│ [🔍 Tìm...] [Sắp xếp: Đến hạn ▼] [+ Thêm] │
├──────┬────────┬──────────────┬───────┬──────┤
│ Mặt trước│Pinyin│Nghĩa TV │Trạng thái│Ôn lại│
├──────┼────────┼──────────────┼───────┼──────┤
│ 学习 │xué xí │Học tập       │🔵 Ôn  │2 ngày│
│ 工作 │gōng zuò│Làm việc     │🟢 Thuộc│7 ngày│
│ 朋友 │péng yǒu│Bạn bè       │🟡 Học │1 ngày│
└──────┴────────┴──────────────┴───────┴──────┘
```

### FSRS State → MasteryBadge mapping

```typescript
const STATE_MAP = {
  0: { label: "Mới", color: "secondary" },
  1: { label: "Đang học", color: "warning" }, // vàng
  2: { label: "Ôn tập", color: "default" }, // xanh dương
  3: { label: "Học lại", color: "destructive" },
};
```

### `SearchAndFilter` – Client Component

```typescript
interface FilterState {
  query: string;
  language: "all" | "zh" | "en";
  sortBy: "next_review" | "mastery" | "created_at";
  sortOrder: "asc" | "desc";
}
```

- Sử dụng `useRouter` + `useSearchParams` để sync filter với URL query params
- URL example: `/library/[id]?q=学&lang=zh&sort=next_review`

### Data fetching (`src/lib/data/library.ts`)

```typescript
getAllDecks(userId): Promise<Deck[]>
getDeckById(deckId): Promise<Deck>
getFlashcardsByDeck(deckId, filters): Promise<Flashcard[]>
```

---

## ✅ Checklist hoàn thành

### Library Page

- [ ] Grid decks responsive: 2 col mobile, 3-4 col desktop
- [ ] `LibraryDeckCard` hiển thị: tên, language badge (🔵 中文 / 🟢 EN), tổng thẻ, due count
- [ ] Chip filter [Tất cả / Tiếng Trung / Tiếng Anh] hoạt động đúng
- [ ] Thanh tìm kiếm filter deck theo tên realtime (client-side)
- [ ] Nút "+ Tạo bộ thẻ mới" mở `CreateDeckDialog` (inline dialog, không navigate)
- [ ] `CreateDeckDialog`: form tên + mô tả + ngôn ngữ, gọi Server Action `createDeck`
- [ ] `DeleteDeckDialog`: hiển thị cảnh báo xóa cascade, gọi Server Action `deleteDeck`
- [ ] Empty state khi không có deck

### Deck Detail Page

- [ ] `DeckDetailHeader` hiển thị 4 stats: tổng thẻ, due, mới, mastery%
- [ ] `mastery_percent` render bằng `Progress` component
- [ ] `FlashcardTable` hiển thị đủ columns: front, pinyin, meaning_vn, state, next_review
- [ ] Sort theo "Đến hạn sớm nhất", "Mức độ thuộc", "Mới nhất" hoạt động
- [ ] Tìm kiếm theo `front` hoặc `meaning_vn` realtime
- [ ] `MasteryBadge` hiển thị đúng màu theo FSRS state
- [ ] Cột "Ôn lại" hiển thị relative time (dùng `dayjs`: "2 ngày", "Hôm nay", "Quá hạn")
- [ ] Mỗi row có icon edit → link đến `/cards/[cardId]/edit`

### Search & Filter

- [ ] Filter state sync với URL search params
- [ ] Filter được reset khi navigate về Library
- [ ] Không fetch lại server khi chỉ đổi filter (client-side filtering)

### General

- [ ] Back button "← Tên deck" trong Deck Detail
- [ ] Breadcrumb hoặc page title đúng
- [ ] Không có lỗi TypeScript
- [ ] Responsive trên mobile
