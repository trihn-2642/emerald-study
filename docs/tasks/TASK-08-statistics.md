# Task 08: Thống kê – Statistics

## ✅ Trạng thái: HOÀN THÀNH

---

## 🎯 Mục tiêu

Xây dựng trang `/stats` — màn hình thống kê tổng quan: tổng số thẻ, chuỗi ngày, thời gian học, độ chính xác, heatmap hoạt động theo năm, phân bố trạng thái FSRS, và bảng thống kê per-deck.

---

## 📋 Prerequisite

- Task 07 (Study History) phải hoàn thành — cần bảng `study_sessions` đã có dữ liệu.

---

## 📁 Các file đã tạo / sửa

### Tạo mới

| File                                          | Mô tả                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/app/(auth)/stats/page.tsx`               | Server Component: fetch dữ liệu + layout responsive, Suspense streaming                             |
| `src/components/stats/StatsSections.tsx`      | Async Server Components: `OverallStatsSection`, `HeatmapSection`, `FsrsSection`, `DeckStatsSection` |
| `src/components/stats/OverallStatsRow.tsx`    | 4 stat cards: tổng thẻ, chuỗi ngày, thời gian học, độ cx                                            |
| `src/components/stats/ActivityHeatmap.tsx`    | Client Component: heatmap cả năm hiện tại (Jan–Dec)                                                 |
| `src/components/stats/FsrsStateBreakdown.tsx` | Bar chart 4 trạng thái FSRS với AnimatedProgress                                                    |
| `src/components/stats/DeckStatsTable.tsx`     | Bảng thống kê per-deck với pagination (6 deck/trang)                                                |
| `src/components/stats/Skeleton.tsx`           | Skeleton cho từng section                                                                           |
| `src/lib/data/statistics.ts`                  | Data fetching: `getOverallStats`, `getActivityHeatmap`, `getFsrsBreakdown`, `getDeckStats`          |

### Sửa

| File                                  | Thay đổi                                              |
| ------------------------------------- | ----------------------------------------------------- |
| `src/components/layout/Sidebar.tsx`   | Href `/stats`, highlight active                       |
| `src/components/layout/BottomNav.tsx` | Tab "Thống kê" link `/stats`                          |
| `src/lib/data/dashboard.ts`           | Fix `getUserStreak`: không reset nếu hôm nay chưa học |

---

## 🏗️ Chi tiết kỹ thuật

### 1. Data Fetching (`src/lib/data/statistics.ts`)

```typescript
export type OverallStats = {
  total_cards: number; // count(flashcards)
  total_reviewed: number; // sum(cards_reviewed) từ study_sessions
  total_time_sec: number; // sum(duration_sec) từ study_sessions
  current_streak: number; // tái dụng getUserStreak() từ dashboard.ts
  avg_accuracy: number; // avg(correct_count / cards_reviewed * 100)
};

export type HeatmapData = Record<string, number>; // { 'YYYY-MM-DD': cards_reviewed }

export type FsrsBreakdown = {
  new: number; // state = 0
  learning: number; // state = 1
  review: number; // state = 2
  relearning: number; // state = 3
};

export type DeckStat = {
  id: string;
  name: string;
  language: 'zh' | 'en';
  card_count: number;
  mastery_percent: number; // % thẻ state=2 (Review)
  session_count: number;
  avg_accuracy: number;
  last_studied_at: string | null;
};
```

- `getActivityHeatmap`: query `study_sessions` từ `{year}-01-01` → hôm nay, GROUP BY ngày
- `getDeckStats`: join `flashcards` + `study_sessions`, sort `last_studied_at DESC NULLS LAST`
- `getFsrsBreakdown`: tên export thực tế là `getFsrsBreakdown` (không phải `getFsrsStateBreakdown`)

### 2. Trang `page.tsx` — Layout Responsive

```
lg (laptop, <1280px):
  Row 1: Heatmap (full width 5/5)
  Row 2: FSRS (2/5) | Deck table (3/5)

xl (PC, ≥1280px):
  Row 1: Heatmap (3/5) | FSRS (2/5)
  Row 2: Deck table (full width 5/5)
```

Dùng CSS Grid 5 cột + `xl:row-start-1` để reorder FSRS lên row 1 trên PC mà không duplicate component.

### 3. `OverallStatsRow` — 4 Cards

| Icon | Label         | Giá trị                              |
| ---- | ------------- | ------------------------------------ |
| 📚   | Tổng số thẻ   | `total_cards`                        |
| 🔥   | Chuỗi ngày    | `current_streak`                     |
| ⏱    | Thời gian học | `total_time_sec` (hiển thị phút/giờ) |
| 🎯   | Độ chính xác  | `avg_accuracy`%                      |

- CountUp animation cho mỗi số.
- Grid `grid-cols-2 lg:grid-cols-4`.

### 4. `ActivityHeatmap` — Heatmap theo năm

- Hiển thị từ **1/1 đến 31/12 năm hiện tại** (không phải 52 tuần rolling).
- Ô trước hôm nay: 5 mức màu (0 = `bg-slate-100`, 1–5 = `bg-emerald-100`, 6–15 = `bg-emerald-300`, 16–30 = `bg-emerald-500`, ≥31 = `bg-emerald-700`).
- Ô tương lai (sau hôm nay): `bg-slate-50` (phân biệt nhưng không hiển thị data).
- Month labels dùng `absolute` positioning tính theo `weekIdx × 13px`.
- Subtitle: "X ngày có học · Y thẻ trong năm YYYY".

### 5. `FsrsStateBreakdown` — Bar Chart

- Stacked bar tổng hợp 4 màu ở trên.
- 4 rows: Mới (slate), Đang học (amber), Đã thuộc (emerald), Cần học lại (red).
- Dùng `AnimatedProgress` từ `@/components/ui/animated-progress`.
- Dùng `CountUp` từ `@/components/ui/count-up`.

### 6. `DeckStatsTable` — Per-Deck Stats

- **Desktop**: table với 6 cột (Bộ thẻ, Số thẻ, Đã thuộc, Phiên học, Độ chính xác, Học lần cuối).
- **Mobile**: cards riêng lẻ với 3 cột tóm tắt.
- Pagination client-side: 6 deck/trang, nằm bên trong card (`border-t border-slate-100 bg-slate-50/50`).
- Mastery: mini progress bar + %.
- Accuracy: màu theo ngưỡng (≥80% emerald, ≥50% amber, <50% red).
- "Học lần cuối": relative time bằng `dayjs` (Hôm nay / Hôm qua / X ngày trước / DD/MM/YYYY).

### 7. Fix Streak Logic (`dashboard.ts`)

```typescript
// Streak KHÔNG reset nếu hôm nay chưa học (chỉ reset ngày hôm sau)
const startOffset = reviewDates.has(today.toDateString()) ? 0 : 1;
for (let i = startOffset; i < 365; i++) { ... }
```

---

## ✅ Checklist

### Phase 1 – Data Fetching

- [x] `getOverallStats(userId)` — total_cards, total_reviewed, total_time_sec, streak, avg_accuracy
- [x] `getActivityHeatmap(userId)` — dữ liệu từ 1/1 năm hiện tại
- [x] `getFsrsBreakdown(userId)` — 4 trạng thái FSRS
- [x] `getDeckStats(userId)` — sort last_studied_at DESC NULLS LAST

### Phase 2 – Components

- [x] `OverallStatsRow` — 4 stat cards với CountUp
- [x] `ActivityHeatmap` — heatmap cả năm, 5 mức màu, ô tương lai mờ
- [x] `FsrsStateBreakdown` — stacked bar + 4 row với AnimatedProgress
- [x] `DeckStatsTable` — table + mobile cards + pagination 6/trang
- [x] `Skeleton.tsx` — skeleton cho từng section

### Phase 3 – Page & Navigation

- [x] `page.tsx` — fetch parallel, layout responsive lg/xl
- [x] `loading.tsx` — skeleton toàn trang
- [x] Sidebar + BottomNav highlight đúng tab "Thống kê" (`/stats`)
- [x] Fix `getUserStreak` — không reset streak nếu hôm nay chưa học
