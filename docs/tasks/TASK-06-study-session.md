# Task 06: Study Session – Phiên học tập

## ✅ Trạng thái: HOÀN THÀNH

---

## 🎯 Mục tiêu

Xây dựng toàn bộ luồng học tập: màn hình danh sách phiên học, flashcard với animation lật thẻ 3D, 4 nút chấm điểm FSRS, điều hướng lịch sử thẻ, chuyển thẻ mượt mà, màn hình hoàn thành với confetti. Đây là tính năng cốt lõi của ứng dụng.

---

## 📁 Các file đã tạo / sửa

### Tạo mới

| File                                         | Mô tả                                                           |
| -------------------------------------------- | --------------------------------------------------------------- |
| `src/app/(auth)/study/page.tsx`              | Trang danh sách phiên học: decks cần ôn hôm nay + đã hoàn thành |
| `src/app/(study)/layout.tsx`                 | Route group layout không có AppShell (full-screen)              |
| `src/app/(study)/study/[deckId]/page.tsx`    | Server Component: load session cards, hỗ trợ `?mode=review`     |
| `src/app/(study)/study/[deckId]/session.tsx` | Client Component: toàn bộ UI phiên học                          |
| `src/components/study/FlashcardView.tsx`     | Thẻ flashcard với flip animation 3D (Framer Motion)             |
| `src/components/study/CardFront.tsx`         | Mặt trước thẻ: hiển thị `front` (chữ Hán/từ vựng Anh)           |
| `src/components/study/CardBack.tsx`          | Mặt sau thẻ: pinyin, meaning_vn, meaning_en, examples           |
| `src/components/study/RatingButtons.tsx`     | 4 nút chấm điểm: Lại / Khó / Tốt / Dễ                           |
| `src/components/study/SessionComplete.tsx`   | Màn hình hoàn thành: thống kê + confetti + nút quay về          |
| `src/components/study/StudyHeader.tsx`       | Header: nút thoát, tên deck, progress, điều hướng lịch sử       |
| `src/lib/data/study.ts`                      | `getDueCards`, `getAllCards`, `updateCardAfterRating`           |
| `src/lib/fsrs.ts`                            | Wrapper cho `ts-fsrs`: hàm `scheduleCard(data, rating)`         |

### Sửa

| File                         | Thay đổi                           |
| ---------------------------- | ---------------------------------- |
| `src/store/useStudyStore.ts` | Thêm `unflipCard()`, `ratingStats` |

---

## 🏗️ Chi tiết kỹ thuật

### Route Architecture

```
(auth)/study/page.tsx          → /study         — danh sách decks (AppShell)
(study)/study/[deckId]/page.tsx → /study/[id]   — phiên học (full-screen, không AppShell)
```

Route group `(study)` có layout riêng không dùng AppShell, giữ màn học tập full-screen.

### `/study` List Page

Server Component. Gọi `getDueDecks(userId)` rồi chia thành:

- `dueDecks` (due_count > 0): hiển thị section "Cần ôn hôm nay", card có border xanh + nút "Học ngay" → `/study/[id]`
- `doneDecks` (due_count === 0 && card_count > 0): section "Đã hoàn thành — ôn lại nếu muốn", nút "Ôn lại" → `/study/[id]?mode=review`

```typescript
const dueDecks = allDecks.filter((d) => d.due_count > 0);
const doneDecks = allDecks.filter((d) => d.due_count === 0 && d.card_count > 0);
```

### `?mode=review` Support

Server Component `page.tsx` đọc `searchParams`:

```typescript
const isReviewAll = mode === 'review';
const result = isReviewAll
  ? await getAllCards(deckId)
  : await getDueCards(deckId);
```

- `getDueCards()`: load thẻ `next_review <= now`, sắp xếp theo `next_review ASC`
- `getAllCards()`: load tất cả thẻ trong deck, sắp xếp theo `created_at ASC`

### `src/lib/fsrs.ts` — scheduleCard

```typescript
export function scheduleCard(
  data: FsrsData,
  rating: Rating,
): { nextData: FsrsData; nextReview: string };
```

⚠️ **Quan trọng**: Thẻ mới (state=0 hoặc reps=0) phải dùng `createEmptyCard()` thay vì map từ DB values. DB có thể lưu `difficulty=5.3` từ `DIFFICULTY_MAP` khi tạo thẻ, nhưng stability=0 là trạng thái không hợp lệ với ts-fsrs.

```typescript
const isNew = data.state === 0 || data.reps === 0;
const card = isNew ? createEmptyCard() : { ...mapFromDb };
```

### `useStudyStore` — State & Actions

```typescript
interface StudyState {
  sessionCards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  ratingStats: Record<number, number>; // { 1: 2, 3: 5, 4: 1 } — breakdown per rating
}

interface StudyActions {
  setSession: (cards: Flashcard[]) => void;
  flipCard: () => void;
  unflipCard: () => void; // ← thêm mới
  nextCard: () => void;
  rateCard: (rating: 1 | 2 | 3 | 4) => void;
  reset: () => void;
}
```

`rateCard` logic:

- `rating === 1` (Again): push card xuống cuối queue, `currentIndex + 1`
- `rating 2/3/4`: chỉ `currentIndex + 1`
- Cập nhật `ratingStats` mỗi lần rate

### Back-Navigation (History Review)

`session.tsx` dùng `viewingIndex: number | null` state riêng (không nằm trong store):

- `null`: đang xem thẻ hiện tại (có thể rate)
- `number`: đang xem lại thẻ đã học (read-only, không hiện RatingButtons)

```
handleBack()    → viewingIndex = displayIndex - 1
handleForward() → viewingIndex = displayIndex + 1 (hoặc null nếu về current)
```

`StudyHeader` hiển thị "Xem lại" badge khi `isReviewing`, và `<` `>` buttons.

### isRatingRef + stateRef (React 19 Anti-double-fire Fix)

Dùng `useRef` thay `useState` để tránh React 19 batching gọi double `handleRate`:

```typescript
const isRatingRef = useRef(false);  // không dùng useState
const stateRef = useRef({ sessionCards, currentIndex, isFlipped, viewingIndex });
stateRef.current = { ... };  // luôn cập nhật ref với giá trị mới nhất
```

### Flip Animation (Framer Motion)

```
FlashcardView
  └── perspective: 1000px
      └── card div: transformStyle preserve-3d, rotateY transition
          ├── CardFront: z-index front face
          └── CardBack: rotateY(180deg) pre-rotated, backfaceVisibility hidden
```

Click thẻ: `flipCard()` → `isFlipped = true`. Không flip ngược lại khi click (chỉ `unflipCard()` từ store hoặc Space).

### Keyboard Shortcuts

| Key                   | Action                                                     |
| --------------------- | ---------------------------------------------------------- |
| `Space`               | Lật thẻ (nếu chưa lật) / unflip (nếu đã lật)               |
| `1` / `2` / `3` / `4` | Chấm điểm (chỉ khi thẻ đã lật + không đang review lịch sử) |
| `←`                   | Xem thẻ trước (history back)                               |
| `→`                   | Xem thẻ tiếp theo (history forward)                        |

### SessionComplete

- `react-confetti` khi hoàn thành
- Stats: tổng thẻ + breakdown rating (Lại/Khó/Tốt/Dễ) từ `ratingStats`
- Nút **"Học lại bộ này"**: reset session với `initialCards` (shuffle lại)
- Nút **"Về Phiên học"**: `href="/study"` (không về `/dashboard`)

### Data Fetching

```typescript
getDueCards(deckId): Promise<StudySession | null>
getAllCards(deckId): Promise<StudySession | null>
updateCardAfterRating(cardId, fsrsData, nextReview): Promise<void>
```

`getDueCards` và `getAllCards` đều wrapped với `React.cache()`. Cả hai đều tính `mastery_percent` parallel.

---

## ✅ Checklist hoàn thành

### /study List Page

- [x] Server Component, dùng `getDueDecks(userId)`
- [x] Section "Cần ôn hôm nay" với due decks
- [x] Section "Đã hoàn thành" với done decks + link `?mode=review`
- [x] Empty state khi không có deck nào
- [x] Header đồng bộ (icon `GraduationCap` + `text-3xl font-black`)
- [x] Sidebar "Phiên học" active khi ở `/study/[deckId]`

### FlashcardView & Animation

- [x] Flip animation 3D theo trục Y mượt mà
- [x] Mặt sau không bị mirror (counter-rotate đúng)
- [x] Click vào thẻ khi chưa flip → flip thẻ
- [x] Back-navigation read-only không cho phép rate

### CardFront

- [x] Chữ Hán hiển thị font lớn, cân giữa
- [x] Tiếng Anh: hiển thị từ vựng + ngôn ngữ badge
- [x] Prompt "Nhấn để xem đáp án"

### CardBack

- [x] Pinyin / meaning_vn / meaning_en
- [x] Danh sách examples

### RatingButtons

- [x] 4 nút xuất hiện chỉ sau khi flip + không đang review lịch sử
- [x] Label + interval hint ("Tốt · 4 ngày")
- [x] Màu đúng: Lại=đỏ, Khó=vàng, Tốt=xanh, Dễ=emerald

### FSRS Logic

- [x] `scheduleCard()` tính đúng với `createEmptyCard()` cho thẻ mới
- [x] `updateCardAfterRating()` cập nhật Supabase
- [x] Rating=1 re-queue thẻ vào cuối

### Back-Navigation

- [x] `viewingIndex` state trong session.tsx
- [x] `handleBack()` / `handleForward()` điều hướng lịch sử
- [x] RatingButtons ẩn khi `isReviewing`
- [x] "Xem lại" badge + `<` `>` buttons trong StudyHeader
- [x] "Quay lại thẻ hiện tại" button

### SessionComplete

- [x] Confetti animation
- [x] Stats breakdown theo rating
- [x] Nút "Về Phiên học" → `/study`
- [x] Nút "Học lại bộ này"

### General

- [x] Keyboard shortcuts: Space, 1/2/3/4, ←, →
- [x] `useRef` để tránh double-fire (React 19)
- [x] `?mode=review` load toàn bộ thẻ
- [x] Không có lỗi TypeScript
