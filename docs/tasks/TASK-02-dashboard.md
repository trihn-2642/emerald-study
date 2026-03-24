# Task 02: Dashboard – Bảng điều khiển chính

## 🎯 Mục tiêu

Xây dựng trang Dashboard hiển thị tổng quan tiến độ học tập hôm nay, danh sách bộ thẻ cần ôn tập, banner streak/thứ hạng, và hoạt động gần đây.

---

## ✅ Trạng thái: HOÀN THÀNH

---

## 📁 Các file đã tạo / sửa

### Tạo mới

| File                                            | Mô tả                                                                                           |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/app/(unth)/dashboard/page.tsx`             | Server Component: 3 Suspense boundaries + FAB                                                   |
| `src/app/(unth)/dashboard/loading.tsx`          | Skeleton loading cho dashboard                                                                  |
| `src/components/dashboard/TodayGoalSection.tsx` | Server wrapper fetches `getTodayStats`, renders `TodayGoalWidget`                               |
| `src/components/dashboard/TodayGoalWidget.tsx`  | Widget "Mục tiêu hôm nay" — Progress bar + CountUp, màu theo ngưỡng                             |
| `src/components/dashboard/StreakSection.tsx`    | Server wrapper fetches streak + activities song song                                            |
| `src/components/dashboard/StreakBanner.tsx`     | Banner thứ hạng động (8 bậc), streak count, XP                                                  |
| `src/components/dashboard/ActivityFeed.tsx`     | Danh sách hoạt động gần đây (2 ngày) với dấu chấm màu                                           |
| `src/components/dashboard/DecksSection.tsx`     | Server wrapper fetches `getDueDecks` + `getTodayStats` song song                                |
| `src/components/dashboard/DeckGrid.tsx`         | Grid bộ thẻ: responsive 1/2/3 col, empty state                                                  |
| `src/components/dashboard/DeckCard.tsx`         | Card deck: badge CN/VN / EN/VN, due count, nút Học ngay / Xem thẻ                               |
| `src/components/dashboard/StatsRow.tsx`         | 4 stat cards với CountUp: Tổng thẻ, Đến hạn, Thẻ mới, Đã thuộc                                  |
| `src/components/dashboard/Skeleton.tsx`         | `TodayGoalSkeleton`, `StreakSkeleton`, `DecksSkeleton`                                          |
| `src/components/layout/UserMenu.tsx`            | Dropdown user menu (avatar initials, tên, đăng xuất)                                            |
| `src/lib/data/dashboard.ts`                     | Server-side data fetching: `getTodayStats`, `getDueDecks`, `getUserStreak`, `getRecentActivity` |
| `src/components/ui/count-up.tsx`                | CountUp animation (IntersectionObserver + rAF, easeOutCubic)                                    |
| `src/constants/index.ts`                        | Hằng số dùng chung: `RANKS`, `XP_PER_STREAK_DAY`, `LANGUAGE_LABELS`                             |
| `src/utils/index.ts`                            | Utility functions: `getRank(xp)`, `getProgressColor(percent)`                                   |

### Sửa

| File                                  | Thay đổi                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/app/(unth)/layout.tsx`           | Fetch user với `getUser()`, pass `userName`/`userEmail` xuống AppShell, auth guard |
| `src/components/layout/AppShell.tsx`  | Sticky global header với UserMenu, FAB → `/cards/new`                              |
| `src/components/layout/Sidebar.tsx`   | Bỏ Settings & Logout; `sticky top-0 h-screen overflow-y-auto`                      |
| `src/components/layout/BottomNav.tsx` | 4 tabs, rounded top                                                                |
| `src/components/ui/progress.tsx`      | Thêm `indicatorClassName` prop để override màu thanh tiến trình                    |
| `src/lib/supabase/server.ts`          | Thêm `getUser()` = `React.cache()` wrapper để dedup auth call                      |

---

## 🏗️ Layout Dashboard

```
┌──────────────────────────────────────────────────────┐
│  [Header] Emerald Study logo           [UserMenu ▼]  │
├──────────┬───────────────────────────────────────────┤
│ Sidebar  │  max-w-6xl mx-auto px-4/8 py-8            │
│ sticky   │                                           │
│ h-screen │  ┌──────────────────────┐ ┌────────────┐  │
│          │  │ TodayGoalWidget      │ │ streakBnr  │  │
│ Trang chủ│  │ [===75%=====]        │ │ Kim Cương  │  │
│ Thư viện │  │ 45 / 60 thẻ          │ │ 🔥 15 ngày │  │
│ Phiên học│  └──────────────────────┘ │ ActivityFd │  │
│ Thống kê │                           │ Hoạt động  │  │
│          │  ┌──────┐┌──────┐┌──────┐┌└────────────┘  │
│          │  │260   ││ 41   ││  4   ││ 75%         │  │
│          │  │Total ││Đến hạn│ Mới  ││ Đã thuộc    │  │
│          │  └──────┘└──────┘└──────┘└─────────────┘  │
│          │                                           │
│          │  Bộ thẻ cần ôn  [Xem tất cả →]           │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│          │  │HSK 1-3   │ │Business  │ │Giao tiếp │  │
│          │  └──────────┘ └──────────┘ └──────────┘  │
│                                          [FAB  +]    │
└──────────┴───────────────────────────────────────────┘
```

Grid: `lg:grid-cols-12` — col-span-8 (TodayGoal) + col-span-4 (Streak + Activity)

---

## 🏗️ Chi tiết kỹ thuật

### Rank system (`src/constants/index.ts` + `src/utils/index.ts`)

| XP (= streak × 30) | Thứ hạng      |
| ------------------ | ------------- |
| 0                  | Học viên      |
| 60                 | Đồng          |
| 150                | Bạc           |
| 300                | Vàng          |
| 510                | Kim Cương I   |
| 750                | Kim Cương II  |
| 1050               | Kim Cương III |
| 1500               | Master        |

`getRank(xp)` trong `src/utils/index.ts` trả về `{ name, minXp, next }`.

### Progress bar màu theo ngưỡng (`TodayGoalWidget`)

| % hoàn thành | Màu thanh                        |
| ------------ | -------------------------------- |
| 0–33%        | `bg-red-400`                     |
| 34–66%       | `bg-amber-400`                   |
| 67–99%       | `bg-emerald-500` + glow          |
| 100%         | `bg-emerald-600` + glow mạnh hơn |

`getProgressColor(percent)` trong `src/utils/index.ts`.

### `StatsRow` — 4 stat cards

- **Tổng thẻ** (Layers, emerald) — tổng `card_count`
- **Đến hạn hôm nay** (Clock, orange) — tổng `due_count`
- **Thẻ mới** (Sparkles, violet) — `newCards` từ `getTodayStats`
- **Đã thuộc** (BookCheck, blue) — trung bình `mastery_percent`

### `CountUp` (`src/components/ui/count-up.tsx`)

```typescript
<CountUp to={260} />
<CountUp to={75} suffix="%" />
<CountUp to={1200} duration={1500} />
```

IntersectionObserver (threshold 0.5) + rAF + easeOutCubic.

### Data fetching (`src/lib/data/dashboard.ts`)

```typescript
getTodayStats(userId)   → { reviewed, total, newCards }
getDueDecks(userId)     → Deck[]
getUserStreak(userId)   → number  (chuỗi ngày liên tiếp)
getRecentActivity(userId) → RecentActivity[]  (2 ngày gần nhất, nhóm theo deck)
```

`getRecentActivity` groups flashcards reviewed in the last 2 days by deck, returns up to 5 items with relative time strings.

### `React.cache()` deduplication

`getUser()` trong `src/lib/supabase/server.ts` dùng `React.cache()` — layout và page đều gọi, nhưng chỉ 1 network request per render tree.

### Suspense streaming

3 independent `<Suspense>` boundaries:

1. `<TodayGoalSection>` — fetches `getTodayStats`
2. `<StreakSection>` — fetches `getUserStreak` + `getRecentActivity` song song
3. `<DecksSection>` — fetches `getDueDecks` + `getTodayStats` song song

---

## ✅ Checklist hoàn thành

### UI Components

- [x] `TodayGoalWidget` — Progress bar màu theo ngưỡng, CountUp
- [x] `StreakBanner` — 8 bậc thứ hạng động, XP, streak count
- [x] `ActivityFeed` — hoạt động 2 ngày gần nhất, dấu chấm màu
- [x] `DeckCard` — badge CN/VN / EN/VN, due count, nút Học ngay / Xem thẻ
- [x] `DeckGrid` — responsive 1/2/3 col, empty state
- [x] `StatsRow` — 4 stat cards với CountUp
- [x] `UserMenu` — dropdown avatar initials + tên + email + Đăng xuất
- [x] `CountUp` — animation component (IntersectionObserver + rAF)
- [x] `Skeleton` — `TodayGoalSkeleton`, `StreakSkeleton` (banner + activity), `DecksSkeleton`

### Layout & Navigation

- [x] Sidebar sticky (`sticky top-0 h-screen overflow-y-auto`)
- [x] Header sticky trong AppShell — blur backdrop, UserMenu
- [x] FAB Thêm thẻ (fixed, bottom-right) — link `/cards/new`
- [x] BottomNav — 4 tabs, ẩn trên `md+`
- [x] Auth guard trong `(unth)/layout.tsx`

### Data Layer

- [x] Supabase tables `decks` + `flashcards` với RLS + indexes
- [x] `getTodayStats()`, `getDueDecks()`, `getUserStreak()`, `getRecentActivity()`
- [x] `React.cache()` deduplication cho `getUser()`
- [x] 3 Suspense boundaries — streaming independent data

### Code Organisation

- [x] `src/constants/index.ts` — `RANKS`, `XP_PER_STREAK_DAY`, `LANGUAGE_LABELS`
- [x] `src/utils/index.ts` — `getRank(xp)`, `getProgressColor(percent)`
- [x] Không còn magic numbers hay inline constants rải rác trong components

### Quality

- [x] Không có lỗi TypeScript
- [x] `loading.tsx` skeleton cho dashboard
- [x] Responsive: mobile (375px) và desktop (1280px)
- [x] Mock data đã xoá, dùng data thật từ Supabase

### Tạo mới

| File                                           | Mô tả                                                                                        |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/app/(unth)/dashboard/page.tsx`            | Server Component: fetch data từ Supabase qua `getTodayStats`, `getDueDecks`, `getUserStreak` |
| `src/components/dashboard/TodayGoalWidget.tsx` | Widget "Mục tiêu hôm nay" với Progress Bar màu theo ngưỡng + CountUp                         |
| `src/components/dashboard/DeckGrid.tsx`        | Grid hiển thị các bộ thẻ cần ôn                                                              |
| `src/components/dashboard/DeckCard.tsx`        | Card đơn lẻ: tên deck, badge language, due count, nút "Học ngay"/"Xem thẻ"                   |
| `src/components/dashboard/StreakBanner.tsx`    | Banner streak (chuỗi ngày học liên tiếp) và câu động lực                                     |
| `src/components/dashboard/StatsRow.tsx`        | 3 stat cards: Tổng thẻ, Đến hạn hôm nay, Đã thuộc (%) với CountUp                            |
| `src/lib/data/dashboard.ts`                    | Server-side data fetching functions (dùng khi có Supabase tables)                            |
| `src/app/(unth)/dashboard/loading.tsx`         | Skeleton loading UI khi Dashboard đang fetch data                                            |
| `src/components/ui/count-up.tsx`               | CountUp animation component (IntersectionObserver + rAF, easeOutCubic)                       |
| `src/components/layout/UserMenu.tsx`           | Dropdown user menu (avatar, tên, đăng xuất) — gắn vào AppShell header                        |

### Sửa

| File                                 | Thay đổi                                                             |
| ------------------------------------ | -------------------------------------------------------------------- |
| `src/app/(unth)/layout.tsx`          | Fetch user, pass `userName`/`userEmail` xuống `AppShell`, auth guard |
| `src/components/layout/AppShell.tsx` | Thêm sticky global header với `UserMenu`                             |
| `src/components/layout/Sidebar.tsx`  | Xoá Settings & Logout; `sticky top-0 h-screen` để không scroll       |
| `src/components/ui/progress.tsx`     | Thêm `indicatorClassName` prop để override màu thanh tiến trình      |

---

## 🏗️ Chi tiết kỹ thuật

### Layout Dashboard

```
┌──────────────────────────────────────────────────────┐
│  [Header] Emerald Study logo           [UserMenu ▼]  │
├──────────┬───────────────────────────────────────────┤
│ Sidebar  │  max-w-6xl mx-auto px-8 py-8             │
│ sticky   │                                           │
│ h-screen │  ┌──────────────────┐ ┌────────────────┐ │
│          │  │ TodayGoalWidget  │ │ StreakBanner   │ │
│ Trang chủ│  │ [===75%=====]    │ │ 🔥 15 ngày    │ │
│ Thư viện │  │ 45 / 60 thẻ      │ │ 450 XP        │ │
│ Phiên học│  └──────────────────┘ └────────────────┘ │
│ Thống kê │                                           │
│          │  ┌─────────┐ ┌─────────┐ ┌─────────────┐ │
│          │  │ 260     │ │ 41      │ │ 75%         │ │
│          │  │ Tổng thẻ│ │ Đến hạn │ │ Đã thuộc    │ │
│          │  └─────────┘ └─────────┘ └─────────────┘ │
│          │                                           │
│          │  Bộ thẻ cần ôn  [Xem tất cả →]           │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│          │  │HSK 1-3   │ │Business  │ │Giao tiếp │  │
│          │  │24 due    │ │12 due    │ │5 due     │  │
│          │  └──────────┘ └──────────┘ └──────────┘  │
└──────────┴───────────────────────────────────────────┘
```

### Progress bar màu theo ngưỡng (`TodayGoalWidget`)

| % hoàn thành | Màu thanh               |
| ------------ | ----------------------- |
| 0–33%        | `bg-red-400`            |
| 34–66%       | `bg-amber-400`          |
| 67–99%       | `bg-emerald-500`        |
| 100%         | `bg-emerald-600` + glow |

### `StatsRow` — 3 stat cards

Không có trong design mockup ban đầu, thêm vào để cung cấp số liệu nhanh:

- **Tổng thẻ** (icon: Layers, màu emerald) — tổng `card_count` của tất cả decks
- **Đến hạn hôm nay** (icon: Clock, màu orange) — tổng `due_count`
- **Đã thuộc** (icon: BookCheck, màu blue) — trung bình `mastery_percent`

Tất cả số liệu dùng `CountUp` animation (easeOutCubic, trigger khi vào viewport).

### `CountUp` Animation (`src/components/ui/count-up.tsx`)

```typescript
<CountUp to={260} suffix="" />          // → 260 (đếm lên)
<CountUp to={75} suffix="%" />          // → 75%
<CountUp to={1200} duration={1500} />   // custom duration (ms)
```

- Trigger bằng `IntersectionObserver` (threshold 0.5)
- Easing: `easeOutCubic` (1 - (1-t)³)
- Reset khi prop `to` thay đổi

### Data fetching (`src/lib/data/dashboard.ts`)

Đã implement nhưng chưa kết nối vì chưa có Supabase tables:

```typescript
getTodayStats(userId): Promise<{ reviewed, total, newCards }>
getDueDecks(userId): Promise<Deck[]>
getUserStreak(userId): Promise<number>
```

---

## ✅ Checklist

### UI Components

- [x] `TodayGoalWidget` — Progress bar màu theo ngưỡng, CountUp cho số thẻ
- [x] `StreakBanner` — streak count, XP, câu động lực theo ngưỡng
- [x] `DeckCard` — badge CN/VN vs EN/VN, due count, nút Học ngay / Xem thẻ
- [x] `DeckGrid` — responsive 1/2/3 col, empty state, link "Xem tất cả"
- [x] `StatsRow` — 3 stat cards với CountUp animation
- [x] `UserMenu` — dropdown với avatar, tên, email, nút Đăng xuất
- [x] `CountUp` — animation component dùng chung

### Layout & Navigation

- [x] Sidebar sticky (`sticky top-0 h-screen`) — không scroll theo content
- [x] Header global trong AppShell — sticky, blur backdrop, UserMenu góc phải
- [x] FAB Thêm thẻ — bottom-right, link `/cards/new`
- [x] BottomNav — 4 tabs, responsive (ẩn trên md+)
- [x] Auth guard chuyển về layout.tsx (không còn trong page.tsx)

### Data Layer

- [x] Tạo Supabase tables (`decks`, `flashcards`) với RLS + indexes
- [x] Kết nối `getTodayStats()`, `getDueDecks()`, `getUserStreak()` vào dashboard page
- [x] dashboard/page.tsx là Server Component, fetch data với `Promise.all`

### General

- [x] Không có lỗi TypeScript
- [x] `loading.tsx` skeleton cho dashboard
- [x] Responsive mobile (375px) và desktop (1280px)
- [x] Mock data đã xoá, dùng data thật từ Supabase

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

- [x] Hiển thị `Progress` component với % chính xác
- [x] Số "X thẻ đã học / Y thẻ cần ôn" hiển thị rõ
- [x] Khi `reviewed >= total`: hiển thị trạng thái "Hoàn thành 🎉"

### DeckCard

- [x] Badge hiển thị số thẻ due với màu đúng theo mức độ
- [x] Nút "Học ngay" link đến `/study/[deckId]`
- [x] Nút "Xem thẻ" link đến `/library/[deckId]` khi due = 0
- [ ] Card có hover effect (Framer Motion `whileHover`)

### DeckGrid

- [x] Grid responsive: 1 col mobile, 2 col tablet, 3 col desktop
- [x] Hiển thị skeleton loading khi fetch data
- [x] Empty state khi không có deck nào

### StreakBanner

- [x] Hiển thị số ngày streak với icon 🔥
- [x] Thứ hạng động thay đổi theo XP
- [x] Gradient nền màu emerald

### StatsRow

- [x] 4 stat items: Tổng thẻ, Đến hạn hôm nay, Thẻ mới, Đã thuộc (%)
- [x] Icon phù hợp từ `lucide-react` cho mỗi stat

### General

- [x] Trang là Server Component, data fetch không dùng `useEffect`
- [x] `loading.tsx` hiển thị skeleton khi dữ liệu đang tải
- [x] Không có lỗi TypeScript
- [x] Responsive trên mobile (375px) và desktop (1280px)
