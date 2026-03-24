# Task 04: Study Session – Phiên học tập

## 🎯 Mục tiêu

Xây dựng toàn bộ luồng học tập: màn hình flashcard với animation lật thẻ 3D, 4 nút chấm điểm FSRS, chuyển thẻ mượt mà, màn hình hoàn thành với confetti. Đây là tính năng cốt lõi của ứng dụng.

---

## 📁 Các file cần tạo / sửa

### Tạo mới

| File                                        | Mô tả                                                  |
| ------------------------------------------- | ------------------------------------------------------ |
| `src/app/(unth)/study/[deckId]/page.tsx`    | Server Component: load session cards, khởi tạo store   |
| `src/app/(unth)/study/[deckId]/session.tsx` | Client Component: toàn bộ UI phiên học ("use client")  |
| `src/components/study/FlashcardView.tsx`    | Thẻ flashcard với flip animation 3D (Framer Motion)    |
| `src/components/study/CardFront.tsx`        | Mặt trước thẻ: hiển thị `front` (chữ Hán/từ vựng Anh)  |
| `src/components/study/CardBack.tsx`         | Mặt sau thẻ: pinyin, meaning_vn, meaning_en, examples  |
| `src/components/study/RatingButtons.tsx`    | 4 nút chấm điểm: Lại / Khó / Tốt / Dễ                  |
| `src/components/study/SessionProgress.tsx`  | Progress bar + "X / Y thẻ" ở header phiên học          |
| `src/components/study/SessionComplete.tsx`  | Màn hình hoàn thành: thống kê + confetti + nút quay về |
| `src/components/study/StudyHeader.tsx`      | Header: nút thoát, tên deck, progress                  |
| `src/lib/data/study.ts`                     | Fetch due cards, update card sau khi rate              |
| `src/lib/fsrs.ts`                           | Wrapper cho `ts-fsrs`: hàm `rateCard(card, rating)`    |

### Sửa

| File                         | Thay đổi                                                  |
| ---------------------------- | --------------------------------------------------------- |
| `src/store/useStudyStore.ts` | Thêm action `rateCard(rating)` gọi FSRS + Supabase update |

---

## 🏗️ Chi tiết kỹ thuật

### Flip Animation (Framer Motion)

```typescript
// FlashcardView.tsx - CSS 3D perspective flip
const variants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

// Parent: style={{ perspective: 1000 }}
// Card:   transformStyle: "preserve-3d"
// Back face: style={{ rotateY: 180 }}  ← counter-rotate để text thẳng
```

### Card Transition Animation

```typescript
// Khi chuyển sang thẻ tiếp theo:
// Thẻ cũ: x: 0 → x: -100vw, opacity: 1 → 0
// Thẻ mới: x: 100vw → x: 0, opacity: 0 → 1
// Dùng AnimatePresence với key={currentIndex}
```

### Rating Buttons (4 nút)

```typescript
interface RatingConfig {
  label: string; // "Lại" | "Khó" | "Tốt" | "Dễ"
  rating: Rating; // ts-fsrs Rating enum: Again=1, Hard=2, Good=3, Easy=4
  interval: string; // "1p" | "2d" | "4d" | "7d" (hint text)
  color: string; // destructive | warning | default | emerald
}
```

### `src/lib/fsrs.ts`

```typescript
import { createEmptyCard, fsrs, generatorParameters, Rating } from "ts-fsrs";

const f = fsrs(generatorParameters({ enable_fuzz: true }));

// ⚠️ Đặt tên khác store action "rateCard" để tránh naming conflict
export function scheduleCard(
  card: FsrsData,
  rating: Rating,
): {
  nextCard: FsrsData;
  nextReview: Date;
} {
  const fsrsCard = mapToFsrsCard(card);
  const result = f.next(fsrsCard, new Date(), rating);
  return {
    nextCard: mapFromFsrsCard(result.card),
    nextReview: result.card.due,
  };
}
```

### `useStudyStore` – rateCard action

```typescript
rateCard: async (rating: Rating) => {
  const { sessionCards, currentIndex } = get();
  const card = sessionCards[currentIndex];

  // 1. Tính FSRS next state (gọi scheduleCard để tránh naming conflict)
  const { nextCard, nextReview } = scheduleCard(card.fsrs_data, rating);

  // 2. Nếu rating === Again (1): đẩy xuống cuối queue
  if (rating === Rating.Again) {
    set({ isFlipped: false, sessionCards: [...sessionCards, card] });
  }

  // 3. Update Supabase (optimistic)
  await updateCardInSupabase(card.id, {
    fsrs_data: nextCard,
    next_review: nextReview,
  });

  // 4. Chuyển sang thẻ tiếp theo
  set({ isFlipped: false, currentIndex: currentIndex + 1 });
};
```

### CardBack Layout

```
┌─────────────────────────────┐
│  学习          ← front      │
│  xué xí        ← pinyin     │
├─────────────────────────────┤
│  Học tập       ← meaning_vn │
│  To study/learn← meaning_en │
├─────────────────────────────┤
│  Ví dụ:                     │
│  我每天学习中文。            │
│  Wǒ měitiān xuéxí zhōngwén. │
│  Tôi học tiếng Trung mỗi ngày│
└─────────────────────────────┘
```

### SessionComplete Screen

- Hiển thị `react-confetti` khi hoàn thành
- Stats: Số thẻ đã học, Phân bổ rating (Lại/Khó/Tốt/Dễ)
- Nút "Về Dashboard" và "Học lại bộ này"

---

## ✅ Checklist hoàn thành

### FlashcardView & Animation

- [ ] Flip animation 3D theo trục Y mượt mà (duration ~0.5s)
- [ ] Mặt sau không bị mirror (counter-rotate đúng)
- [ ] Click vào thẻ khi chưa flip → flip thẻ
- [ ] Click vào thẻ khi đã flip → không flip lại (chỉ nút rating mới tiếp tục)
- [ ] Card transition: slide-out trái, slide-in phải khi chuyển thẻ

### CardFront

- [ ] Chữ Hán hiển thị font lớn (≥ 48px), cân giữa
- [ ] Nếu là tiếng Anh: hiển thị từ vựng + icon ngôn ngữ
- [ ] Prompt "Nhấn để xem đáp án" ở phía dưới

### CardBack

- [ ] Hiển thị pinyin (nếu có) với màu nhạt hơn
- [ ] `meaning_vn` nổi bật, `meaning_en` phụ
- [ ] Ví dụ: hiển thị tối đa 2 examples, có thể scroll
- [ ] Không hiển thị ví dụ nếu `examples` rỗng

### RatingButtons

- [ ] 4 nút xuất hiện chỉ sau khi flip thẻ
- [ ] Mỗi nút có label + interval hint ("Tốt · 4 ngày")
- [ ] Màu đúng: Lại=đỏ, Khó=vàng, Tốt=xanh dương, Dễ=emerald
- [ ] Sau khi nhấn: gọi `rateCard()`, chuyển thẻ tiếp theo
- [ ] Disable nút khi đang xử lý (loading state)

### SessionProgress

- [ ] Progress bar cập nhật sau mỗi thẻ
- [ ] Hiển thị "X / Y" số thẻ

### FSRS Logic

- [ ] `rateCard()` tính đúng next state dựa trên `ts-fsrs`
- [ ] `next_review` được cập nhật lên Supabase sau mỗi lần rate
- [ ] Rating=1 (Lại) đưa thẻ vào cuối queue hiện tại (không kết thúc session)

### SessionComplete

- [ ] Confetti animation khi hoàn thành (`react-confetti`)
- [ ] Hiển thị summary: tổng thẻ, breakdown theo rating
- [ ] Nút "Về Dashboard" navigate về `/dashboard`
- [ ] Nút "Học lại" reset session với các thẻ rated Again

### General

- [ ] Vuốt sang trái/phải (swipe) trên mobile để rate (optional, nếu có thời gian)
- [ ] Keyboard shortcuts: Space=flip, 1/2/3/4=rating (desktop)
- [ ] Không thể back browser để tránh mất session state
- [ ] Không có lỗi TypeScript
