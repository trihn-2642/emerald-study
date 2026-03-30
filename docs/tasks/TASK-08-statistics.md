# Task 08: Thống kê – Statistics

## 🔲 Trạng thái: CHƯA BẮT ĐẦU

---

## 🎯 Mục tiêu

Xây dựng trang `/thong-ke` — màn hình thống kê tổng quan: tổng thời gian học, heatmap hoạt động, phân bố trạng thái FSRS, và bảng thống kê per-deck.

---

## 📋 Prerequisite

- Task 07 (Study History) phải hoàn thành — cần bảng `study_sessions` đã có dữ liệu.

---

## 📁 Các file cần tạo / sửa

### Tạo mới

| File                                          | Mô tả                                        |
| --------------------------------------------- | -------------------------------------------- |
| `src/app/(auth)/thong-ke/page.tsx`            | Server Component: trang thống kê tổng quan   |
| `src/app/(auth)/thong-ke/loading.tsx`         | Skeleton loading                             |
| `src/components/stats/OverallStatsRow.tsx`    | Server Component: 4 stat cards tổng quan     |
| `src/components/stats/ActivityHeatmap.tsx`    | Client Component: heatmap 52 tuần (CSS grid) |
| `src/components/stats/FsrsStateBreakdown.tsx` | Server Component: bar chart trạng thái FSRS  |
| `src/components/stats/DeckStatsTable.tsx`     | Server Component: bảng thống kê per-deck     |
| `src/components/stats/Skeleton.tsx`           | Skeleton cho từng section                    |
| `src/lib/data/statistics.ts`                  | Data fetching functions                      |

### Sửa

| File                                  | Thay đổi                                      |
| ------------------------------------- | --------------------------------------------- |
| `src/components/layout/Sidebar.tsx`   | Đảm bảo `/thong-ke` được highlight khi active |
| `src/components/layout/BottomNav.tsx` | Đảm bảo tab "Thống kê" link đúng `/thong-ke`  |

---

## 🏗️ Chi tiết kỹ thuật

### 1. Data Fetching (`src/lib/data/statistics.ts`)

```typescript
// Tổng quan all-time
export async function getOverallStats(userId: string): Promise<{
  total_time_sec: number; // sum(duration_sec) từ study_sessions
  total_reviewed: number; // sum(cards_reviewed)
  current_streak: number; // tái dụng getUserStreak() từ dashboard.ts
  avg_accuracy: number; // avg(correct_count / cards_reviewed * 100)
}>;

// Heatmap: số thẻ học mỗi ngày trong 365 ngày gần nhất
export async function getActivityHeatmap(userId: string): Promise<
  Record<string, number> // { '2026-03-01': 42, '2026-03-02': 0, ... }
>;
// Query: study_sessions GROUP BY date(started_at), sum(cards_reviewed)
// Trả về chỉ những ngày có học (client fill 0 cho những ngày còn lại)

// Phân bố FSRS state
export async function getFsrsStateBreakdown(userId: string): Promise<{
  new: number; // state = 0
  learning: number; // state = 1
  review: number; // state = 2
  relearning: number; // state = 3
}>;
// Query: flashcards GROUP BY fsrs_data->>'state'

// Thống kê per-deck
export async function getDeckStats(userId: string): Promise<
  {
    id: string;
    name: string;
    language: 'zh' | 'en';
    card_count: number;
    mastery_percent: number; // % thẻ state=2 (Review)
    session_count: number; // count từ study_sessions
    avg_accuracy: number; // avg accuracy từ study_sessions
    last_studied_at: string | null;
  }[]
>;
// Sort: last_studied_at DESC NULLS LAST
```

### 2. Trang `page.tsx`

```tsx
// src/app/(auth)/thong-ke/page.tsx
import { Suspense } from 'react';
import { OverallStatsRow } from '@/components/stats/OverallStatsRow';
import { ActivityHeatmap } from '@/components/stats/ActivityHeatmap';
import { FsrsStateBreakdown } from '@/components/stats/FsrsStateBreakdown';
import { DeckStatsTable } from '@/components/stats/DeckStatsTable';

export default async function StatisticsPage() {
  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div>
        <p className="mb-1 text-xs font-bold tracking-widest text-emerald-600 uppercase">
          THỐNG KÊ
        </p>
        <h1 className="text-on-surface text-3xl font-black tracking-tight">
          Tổng quan học tập
        </h1>
      </div>

      {/* Suspense 1: Overall stats */}
      <Suspense fallback={<OverallStatsSkeleton />}>
        <OverallStatsRow />
      </Suspense>

      {/* Suspense 2: Heatmap */}
      <section>
        <h2 className="text-on-surface mb-3 text-sm font-bold">
          Hoạt động học tập
        </h2>
        <Suspense fallback={<HeatmapSkeleton />}>
          <ActivityHeatmap />
        </Suspense>
      </section>

      {/* Suspense 3 & 4: Side by side on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-on-surface mb-3 text-sm font-bold">
            Trạng thái thẻ (FSRS)
          </h2>
          <Suspense fallback={<FsrsBreakdownSkeleton />}>
            <FsrsStateBreakdown />
          </Suspense>
        </section>
        <section>{/* placeholder for future chart */}</section>
      </div>

      {/* Suspense 5: Deck stats table */}
      <section>
        <h2 className="text-on-surface mb-3 text-sm font-bold">
          Thống kê theo bộ thẻ
        </h2>
        <Suspense fallback={<DeckStatsSkeleton />}>
          <DeckStatsTable />
        </Suspense>
      </section>
    </div>
  );
}
```

### 3. `OverallStatsRow` — 4 Cards

```
┌────────────┬──────────────┬───────────────┬────────────────────┐
│ ⏱ Thời    │ 📚 Thẻ đã   │ 🔥 Streak     │ 🎯 Độ chính xác   │
│   gian học │   ôn         │   hiện tại    │   trung bình       │
│            │              │               │                    │
│ 45.2 giờ  │ 8,430 thẻ   │ 12 ngày       │ 89%                │
└────────────┴──────────────┴───────────────┴────────────────────┘
```

- CountUp animation cho mỗi số.
- Grid `grid-cols-2 lg:grid-cols-4`.
- Dùng shadcn `<Card>` + `<CardContent>`.

### 4. `ActivityHeatmap` — CSS Grid Heatmap

- 52 cột × 7 hàng = 364 ô, mỗi ô = 1 ngày.
- Scroll ngang trên mobile.
- Màu intensity dựa trên `cards_reviewed`:
  - 0: `bg-slate-100`
  - 1–9: `bg-emerald-100`
  - 10–29: `bg-emerald-300`
  - 30–59: `bg-emerald-500`
  - ≥ 60: `bg-emerald-700`
- Tooltip khi hover: "DD/MM/YYYY — X thẻ đã ôn" (dùng `title` attribute đơn giản).
- Labels tháng ở trên, labels ngày trong tuần (T2/T4/T6) ở bên trái.

```tsx
// Implementation pattern
const weeks = generateWeeks(365); // [{date, count}[] × 7][]
return (
  <div className="overflow-x-auto">
    <div
      className="grid grid-flow-col gap-1"
      style={{ gridTemplateRows: 'repeat(7, 1fr)' }}
    >
      {weeks.flat().map((day) => (
        <div
          key={day.date}
          title={`${day.date} — ${day.count} thẻ`}
          className={cn('h-3 w-3 rounded-sm', getHeatmapColor(day.count))}
        />
      ))}
    </div>
  </div>
);
```

### 5. `FsrsStateBreakdown` — Bar Chart

```
Mới          ████████░░░░░░░░░░░░  240 thẻ
Đang học     ███░░░░░░░░░░░░░░░░░   85 thẻ
Ôn tập       ████████████████░░░░  480 thẻ
Học lại      █░░░░░░░░░░░░░░░░░░░   12 thẻ
```

- Mỗi state = 1 row: label (w-20) + bar (flex-1) + count (w-16 text-right).
- Bar dùng `<div>` với `width: X%` (tỉ lệ so với max state count).
- Màu bar: Mới = `bg-slate-300`, Đang học = `bg-amber-400`, Ôn tập = `bg-emerald-500`, Học lại = `bg-red-400`.
- Dùng shadcn `<Card>` bao ngoài.

### 6. `DeckStatsTable` — Per-Deck Stats

Dùng shadcn `<Table>`:

| Bộ thẻ          | Tổng thẻ | Đã thuộc | Phiên học | Độ chính xác | Lần cuối     |
| --------------- | -------- | -------- | --------- | ------------ | ------------ |
| [lang] Tên deck | 120      | 75%      | 8         | 91%          | 2 ngày trước |

- Badge ngôn ngữ bên trái tên deck.
- "Đã thuộc %" = progress bar mini + số %.
- "Lần cuối" = `dayjs(last_studied_at).fromNow()`.
- Empty state nếu user chưa có deck nào.
- Không cần pagination — hiển thị tất cả deck (thường < 20).

---

## 🎨 Design Tokens sử dụng

- `bg-surface-page` — nền trang
- `bg-white` — card
- `text-on-surface` — text chính
- `text-slate-400` — text muted
- `emerald-600` — section label + stats icon
- Heatmap: `bg-emerald-100/300/500/700`
- FSRS bars: `bg-slate-300`, `bg-amber-400`, `bg-emerald-500`, `bg-red-400`

---

## ✅ Checklist

### Phase 1 – Data Fetching

- [ ] Implement `getOverallStats(userId)` trong `statistics.ts`
- [ ] Implement `getActivityHeatmap(userId)` — 365 ngày gần nhất
- [ ] Implement `getFsrsStateBreakdown(userId)`
- [ ] Implement `getDeckStats(userId)`

### Phase 2 – Components

- [ ] `OverallStatsRow` — 4 stat cards với CountUp
- [ ] `ActivityHeatmap` — CSS grid 52×7, 5 mức màu intensity
- [ ] `FsrsStateBreakdown` — bar chart 4 states
- [ ] `DeckStatsTable` — table với badge + progress mini + relative time
- [ ] Skeleton components cho từng section

### Phase 3 – Page & Navigation

- [ ] `page.tsx` với `<Suspense>` cho từng section
- [ ] `loading.tsx` skeleton toàn trang
- [ ] Đảm bảo Sidebar + BottomNav highlight đúng tab "Thống kê"
- [ ] Responsive: stacking mobile, grid 2-col trên desktop
