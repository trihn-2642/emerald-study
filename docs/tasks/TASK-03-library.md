# Task 03: Library – Thư viện & Chi tiết bộ thẻ

## 🎯 Mục tiêu

Xây dựng trang Thư viện để xem tất cả bộ thẻ, tìm kiếm/lọc/sắp xếp flashcard, và trang Chi tiết bộ thẻ (Deck Detail) hiển thị danh sách thẻ dạng bảng với thông tin FSRS.

---

## 📁 Các file đã tạo

| File                                             | Mô tả                                                                                                                                  |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/(auth)/library/page.tsx`                | Server Component: trang thư viện, 2 Suspense section stream độc lập                                                                    |
| `src/app/(auth)/library/[deckId]/cards/page.tsx` | Server Component: Chi tiết 1 deck, danh sách thẻ (bảng)                                                                                |
| `src/lib/data/library.ts`                        | Data fetching + Server Actions: `getAllDecks` (cached), `getDeckById`, `getFlashcardsByDeck`, `createDeck`, `updateDeck`, `deleteDeck` |
| `src/components/library/LibraryDecksSection.tsx` | Server Component: fetch decks, render grid hoặc empty state                                                                            |
| `src/components/library/LibraryStatsSection.tsx` | Server Component: fetch decks (cached), render CTA + stats 2×2 tiles                                                                   |
| `src/components/library/Skeleton.tsx`            | `DeckGridSkeleton`, `DeckCardSkeleton`, `LibraryStatsSkeleton`, `StatTileSkeleton`                                                     |
| `src/components/library/CreateDeckDialog.tsx`    | Dialog tạo deck mới + `useOptimistic` callback + toast + loading overlay                                                               |
| `src/components/library/EditDeckDialog.tsx`      | Dialog chỉnh sửa deck, prefilled form, gọi `updateDeck` + toast + loading overlay                                                      |
| `src/components/library/DeleteDeckDialog.tsx`    | Dialog xác nhận xóa deck (cascade flashcards)                                                                                          |
| `src/components/library/DeckListGrid.tsx`        | Client Component: grid decks + search + filter + sort (shadcn `Select`) + `useOptimistic`                                              |
| `src/components/library/LibraryDeckCard.tsx`     | Card Bento: 3-dot `DropdownMenu` (Edit/Delete), confirmation dialog, mastery ring, due badge, loading overlay                          |
| `src/components/cards/DeckDetailHeader.tsx`      | Header deck detail: 4 stats + nút Học ngay + DeleteDeckDialog                                                                          |
| `src/components/cards/FlashcardTable.tsx`        | Client Component: bảng thẻ + search + state filter + pagination (10/trang) + `ExampleCell` expand/collapse + delete dialog + edit link |
| `src/components/cards/MasteryBadge.tsx`          | Badge FSRS state: Mới / Đang học / Ôn tập / Học lại                                                                                    |
| `src/components/library/MasteryRing.tsx`         | SVG mastery ring hiển thị % thuộc lòng trên LibraryDeckCard                                                                            |

---

## 🏗️ Chi tiết kỹ thuật

### Layout Library Page

```
┌──────────────────────────────────────────────────────┐
│ Thư viện của bạn               [+ Tạo bộ thẻ mới]   │
├──────────────────────────────────────────────────────┤
│ [🔍 Tìm bộ thẻ theo tên...]                          │
│ [Tất cả] [Tiếng Trung] [Tiếng Anh]    [Ngày ôn ▼]   │
├──────────┬──────────┬──────────┬──────────────────────┤
│ HSK 1-3  │ Business │ Vocab Pro│  [+ Thêm bộ thẻ mới] │
│ 📗 57%   │ 📗 50%   │ 📗 33%  │  (dashed placeholder) │
│ Cần ôn:6 │ Cần ôn:3 │ Cần ôn:2│                       │
│ CN/VN    │ EN/VN    │ CN/VN   │                       │
└──────────┴──────────┴──────────┴──────────────────────┘
│  [⚡ Mục tiêu hôm nay]          [📊 Thống kê nhanh]  │
└──────────────────────────────────────────────────────┘
```

### Layout Deck Detail Page

```
┌─────────────────────────────────────────────┐
│ ← Thư viện                                  │
│ 📗 Hán tự HSK 1-3  [CN/VN]  [Học ngay (6)] │
│ 7 thẻ | 6 cần ôn | 0 mới | 57% thuộc lòng  │
├─────────────────────────────────────────────┤
│ [🔍 Tìm thẻ...]    [Trạng thái ▼]                │
├─────┬────────┬──────────────┬──────┬──────┬──┤
│ Từ  │ Phiên âm│Nghĩa TV    │T.Anh │Trạng  │ Ôn │ Sửa│
├─────┼────────┼──────────────┼──────┼──────┼──┤
│ 学习 │ xué xí │ Học tập      │...   │Đang học│Hôm│  ✏️  │
│ 工作 │gōng zuò│ Làm việc    │...   │Ôn tập │ 7ng│  ✏️  │
└─────┴────────┴──────────────┴──────┴──────┴──┴──────┘
```

**Columns (FlashcardTable)**:

- ZH: Chữ Hán | Phiên âm | Tiếng Việt | Tiếng Anh | Ví dụ | Trạng thái | Ôn tiếp | Lần cuối | Lịch sử | Thao tác
- EN: Từ vựng | Tiếng Việt | Tiếng Trung | Ví dụ | Trạng thái | Ôn tiếp | Lần cuối | Lịch sử | Thao tác
- **Ví dụ**: `ExampleCell` component hiển thị 1 ví dụ mặc định, nút expand "+X ví dụ"
- **Trạng thái**: filter dropdown ([Tất cả / Đã thuộc / Đang học / Mới / Học lại])
- **Pagination**: 10 thẻ / trang

### FSRS State → MasteryBadge mapping

```typescript
const STATE_MAP = {
  0: { label: 'Mới', className: 'bg-blue-500/10 text-blue-600' },
  1: { label: 'Đang học', className: 'bg-orange-500/10 text-orange-600' },
  2: { label: 'Đã thuộc', className: 'bg-emerald-500/10 text-emerald-600' },
  3: { label: 'Học lại', className: 'bg-red-500/10 text-red-600' },
};
```

### Mastery Ring SVG (LibraryDeckCard)

```tsx
// stroke-dasharray="100" + stroke-dashoffset = 100 - mastery%
// Màu ring: >= 80% → emerald-600 | >= 60% → emerald-500 | >= 40% → blue-500 | < 40% → orange-400
<circle
  strokeDasharray="100"
  strokeDashoffset={100 - mastery}
  className="-rotate-90"
/>
```

### Optimistic Creation (DeckListGrid + CreateDeckDialog)

```typescript
// DeckListGrid — useOptimistic
const [optimisticDecks, addOptimisticDeck] = useOptimistic(
  decks,
  (state, newDeck: Deck) => [...state, newDeck],
);

function handleOptimisticCreate(data: DeckFormData) {
  addOptimisticDeck({ id: `temp-${Date.now()}`, ...data, card_count: 0, ... });
}

// CreateDeckDialog — gọi callback TRƯỚC server action (bên trong startTransition)
startTransition(async () => {
  onOptimisticCreate?.(data);          // hiển thị fake deck ngay lập tức
  const result = await createDeck(data); // gọi server action
  if ('success' in result) router.refresh(); // revalidate để lấy real deck
});
```

- Optimistic deck hiển thị với `animate-pulse opacity-70` và `pointer-events-none`
- Sau khi `router.refresh()` hoàn thành, `useOptimistic` tự drop fake deck → real deck xuất hiện

### Data fetching + Mutations (`src/lib/data/library.ts`)

```typescript
// Data fetching (React.cache)
getAllDecks(userId: string): Promise<Deck[]>           // cached — shared across Suspense sections
getDeckById(deckId: string, userId: string): Promise<DeckDetail | null>
getFlashcardsByDeck(deckId: string): Promise<Flashcard[]>

// Server Actions
createDeck(input: DeckInput): Promise<{ error: string } | { success: true }>
updateDeck(deckId: string, input: DeckUpdateInput): Promise<{ error: string } | { success: true }>
deleteDeck(deckId: string): Promise<{ error: string } | { success: true }>
```

- `DeckDetail extends Deck` với thêm trường `new_count: number`
- Stats (card_count, due_count, mastery_percent, new_count) được tính parallel bằng `Promise.all`
- `getAllDecks` wrap bằng `React.cache()` — 2 Suspense sections gọi riêng nhưng chỉ fetch 1 lần/request
- `createDeck`/`deleteDeck` đặt trong cùng file với `'use server'` directive

---

## ✅ Checklist hoàn thành

### Library Page

- [x] Grid decks responsive: 1 col → 2 col (sm) → 3 col (lg) → 4 col (xl)
- [x] `LibraryDeckCard` Bento card: circular mastery ring SVG, due badge (pulse), language badge, card count
- [x] Chip filter [Tất cả / Tiếng Trung / Tiếng Anh] hoạt động client-side
- [x] Thanh tìm kiếm filter deck theo tên realtime (client-side, không fetch server)
- [x] Sort: Ngày ôn tập / Mức độ thuộc / Tên A-Z / Tên Z-A
- [x] Nút “+ Tạo bộ thẻ mới” (header) mở `CreateDeckDialog` tự quản lý state
- [x] Dashed placeholder card mở `CreateDeckDialog` (controlled, không render thêm button)
- [x] `CreateDeckDialog`: form tên + mô tả + ngôn ngữ, Zod validation, gọi Server Action `createDeck`
- [x] `useOptimistic` — deck mới hiển thị ngay lập tức, không delay 2-3s
- [x] `EditDeckDialog`: form prefilled từ deck prop, gọi Server Action `updateDeck`, `useEffect` sync khi deck prop thay đổi
- [x] `DeleteDeckDialog`: cảnh báo xóa cascade, gọi Server Action `deleteDeck`
- [x] 3-dot `DropdownMenu` trên mỗi `LibraryDeckCard` — Edit / Delete
- [x] Delete confirmation `Dialog` trong `LibraryDeckCard` (state `deleteOpen`)
- [x] `dropdownOpen` state giữ card elevated khi menu đang mở
- [x] Toast cho tất cả CRUD: tạo ✅, edit ✅, xóa ✅ (dùng `sonner`)
- [x] Loading overlay (`src/app/loading.tsx`) khi `isPending` trong Create / Edit / Delete
- [x] shadcn `Select` cho sort dropdown (thay `<select>` native)
- [x] Empty state khi không có deck
- [x] Featured section: CTA gradient card + stats 2×2 tiles với CountUp animation
- [x] Hydration-safe: không dùng RSC children vào DialogTrigger asChild
- [x] Suspense streaming: `LibraryDecksSection` + `LibraryStatsSection` stream độc lập
- [x] `getAllDecks` cached với `React.cache()` — 2 sections dùng chung 1 fetch/request

### Deck Detail Page

- [x] `DeckDetailHeader` hiển thị 4 stats: tổng thẻ, due, mới, mastery%
- [x] Back button "← Thư viện" với Link về `/library`
- [x] Nút "Học ngay (N)" link đến `/study/[deckId]` khi có due cards; "Ôn lại bộ này" → `/study/[deckId]?mode=review` khi due=0
- [x] `FlashcardTable` hiển thị đủ columns: front, pinyin, meaning_vn, state badge, next_review, edit icon
- [x] Sort: Ngày ôn / Từ A-Z / Trạng thái
- [x] Tìm kiếm theo `front`, `pinyin`, hoặc `meaning_vn` realtime
- [x] `MasteryBadge` hiển thị đúng màu theo FSRS state (0-3)
- [x] Cột "Ôn tiếp" dùng `dayjs`: "Quá hạn" (đỏ), "Hôm nay" (cam), "Ngày mai" (vàng), "X ngày" (muted)
- [x] Mỗi row có icon edit → link đến `/library/[deckId]/cards/[cardId]/edit`
- [x] 404 (`notFound()`) khi deck không tồn tại hoặc không thuộc user

### Search & Filter

- [x] Filter state quản lý client-side bằng `useState` trong `DeckListGrid`
- [x] Không fetch lại server khi đổi filter — chỉ filter `optimisticDecks` array
- [x] Tìm kiếm deck tên: partial match, case-insensitive

### UI Enhancements

- [x] CountUp animation cho tất cả số liệu trong stats card (sử dụng `src/components/ui/count-up.tsx`)
- [x] Stats card dạng 2×2 grid tile: Đã thuộc / Tổng thẻ / Cần ôn hôm nay / Ngôn ngữ
- [x] Tỉ lệ thuộc lòng (masteredPct) hiển thị trong tile "Đã thuộc"
- [x] Language badges CN/EN với count trong tile "Ngôn ngữ"

### General

- [x] Không có lỗi TypeScript
- [x] Không có lỗi ESLint
- [x] Responsive mobile-first
- [x] Server Components cho tất cả pages, Client Components chỉ cho interactive parts
- [x] `revalidatePath('/library')` sau mỗi Server Action mutation
