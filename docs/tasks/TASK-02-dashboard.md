# Task 02: Dashboard – Bảng điều khiển chính

## 🎯 Mục tiêu

Xây dựng trang Dashboard hiển thị tổng quan tiến độ học tập hôm nay, danh sách bộ thẻ cần ôn tập, và banner streak/mục tiêu. Dữ liệu được fetch từ Supabase ở Server Component.

---

## 📁 Các file cần tạo / sửa

### Tạo mới

| File                                           | Mô tả                                                                 |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| `src/app/(unth)/dashboard/page.tsx`            | Server Component: fetch data, render layout Dashboard                 |
| `src/components/dashboard/TodayGoalWidget.tsx` | Widget "Mục tiêu hôm nay" với Progress Bar                            |
| `src/components/dashboard/DeckGrid.tsx`        | Grid hiển thị các bộ thẻ cần ôn                                       |
| `src/components/dashboard/DeckCard.tsx`        | Card đơn lẻ trong DeckGrid: tên deck, badge due count, nút "Học ngay" |
| `src/components/dashboard/StreakBanner.tsx`    | Banner streak (chuỗi ngày học liên tiếp) và câu động lực              |
| `src/components/dashboard/StatsRow.tsx`        | Hàng thống kê nhanh: Tổng thẻ, Đến hạn, Đã thuộc                      |
| `src/lib/data/dashboard.ts`                    | Server-side data fetching functions cho Dashboard                     |
| `src/app/(unth)/dashboard/loading.tsx`         | Skeleton loading UI khi Dashboard đang fetch data                     |

### Sửa

| File                      | Thay đổi                   |
| ------------------------- | -------------------------- |
| `src/app/(unth)/page.tsx` | Redirect sang `/dashboard` |

---

## 🏗️ Chi tiết kỹ thuật

### Layout Dashboard (theo UI design)

```
┌─────────────────────────────────────────┐
│  Chào buổi sáng! 👋                      │
│  Hôm nay bạn có X thẻ cần ôn.           │
├──────────────────┬──────────────────────┤
│  Mục tiêu hôm nay│  Cam Cường ơi        │
│  [====45%====]   │  [StreakBanner]       │
│  45/100 thẻ      │  🔥 5 ngày liên tiếp │
├──────────────────┴──────────────────────┤
│  Bộ thẻ cần ôn hôm nay                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ HSK 1-3  │ │ Business │ │ Tự do    │ │
│  │ 🔴 54 due│ │ 🟡 12 due│ │ 🟢 0 due │ │
│  │[Học ngay]│ │[Học ngay]│ │[Xem thẻ] │ │
│  └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────┘
```

### `TodayGoalWidget` Props

```typescript
interface TodayGoalWidgetProps {
  reviewed: number; // Số thẻ đã ôn hôm nay
  total: number; // Tổng số thẻ cần ôn
  newCards: number; // Số thẻ mới
}
```

### `DeckCard` Props

```typescript
interface DeckCardProps {
  deck: Deck;
  // due_count > 0: hiển thị badge đỏ + nút "Học ngay"
  // due_count === 0: badge xanh + nút "Xem thẻ"
}
```

### Data fetching (`src/lib/data/dashboard.ts`)

```typescript
// Queries cần implement:
getTodayStats(userId): Promise<{ reviewed, total, newCards }>
getDueDecks(userId): Promise<Deck[]>
getUserStreak(userId): Promise<number>
```

### Badge màu theo due count

- `due > 20`: `variant="destructive"` (đỏ)
- `due 1-20`: màu vàng (custom class)
- `due === 0`: `variant="secondary"` (xanh)

---

## ✅ Checklist hoàn thành

### Data Layer

- [ ] `getTodayStats()` trả đúng số thẻ reviewed/total hôm nay
- [ ] `getDueDecks()` filter deck có `next_review <= now()`
- [ ] `getUserStreak()` tính streak từ lịch sử học

### TodayGoalWidget

- [ ] Hiển thị `Progress` component với % chính xác
- [ ] Số "X thẻ đã học / Y thẻ cần ôn" hiển thị rõ
- [ ] Khi `reviewed >= total`: hiển thị trạng thái "Hoàn thành 🎉"

### DeckCard

- [ ] Badge hiển thị số thẻ due với màu đúng theo mức độ
- [ ] Nút "Học ngay" link đến `/study/[deckId]`
- [ ] Nút "Xem thẻ" link đến `/library/[deckId]` khi due = 0
- [ ] Card có hover effect (Framer Motion `whileHover`)

### DeckGrid

- [ ] Grid responsive: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] Hiển thị skeleton loading khi fetch data
- [ ] Empty state khi không có deck nào

### StreakBanner

- [ ] Hiển thị số ngày streak với icon 🔥
- [ ] Câu động lực thay đổi theo số streak
- [ ] Gradient nền màu emerald

### StatsRow

- [ ] 3 stat items: Tổng thẻ, Đến hạn hôm nay, Đã thuộc (%)
- [ ] Icon phù hợp từ `lucide-react` cho mỗi stat

### General

- [ ] Trang là Server Component, data fetch không dùng `useEffect`
- [ ] `loading.tsx` hiển thị skeleton khi dữ liệu đang tải
- [ ] Không có lỗi TypeScript
- [ ] Responsive trên mobile (375px) và desktop (1280px)
- [ ] Loading state dùng `loading.tsx` hoặc Suspense
- [ ] Không có lỗi TypeScript
- [ ] Responsive trên mobile (375px) và desktop (1280px)
