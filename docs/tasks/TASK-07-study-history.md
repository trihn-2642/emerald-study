# Task 07: Lịch sử phiên học – Study History

## ✅ Trạng thái: HOÀN THÀNH

---

## 🎯 Mục tiêu

Xây dựng tính năng ghi nhận và hiển thị lịch sử phiên học:

1. **Lưu session** mỗi khi người dùng hoàn thành 1 phiên học vào bảng `study_sessions`.
2. **Trang `/study/history`**: danh sách phiên học với filters, summary stats, bảng phân trang.

---

## 📋 Prerequisite

- Task 06 (Study Session) phải hoàn thành.
- Chạy migration SQL tạo bảng `study_sessions` trước khi bắt đầu dev.

---

## 🗄️ Database Migration

Chạy trong Supabase SQL Editor:

```sql
create table study_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  deck_id           uuid not null references decks(id) on delete cascade,
  started_at        timestamptz not null,
  ended_at          timestamptz not null,
  duration_sec      integer not null default 0,
  cards_total       integer not null default 0,
  cards_reviewed    integer not null default 0,
  correct_count     integer not null default 0,
  mode              text not null check (mode in ('due', 'review')) default 'due',
  rating_breakdown  jsonb not null default '{"again":0,"hard":0,"good":0,"easy":0}'::jsonb
);

alter table study_sessions enable row level security;
create policy "Users manage own sessions"
  on study_sessions for all using (auth.uid() = user_id);

-- Performance indexes
create index idx_study_sessions_user_started on study_sessions (user_id, started_at desc);
create index idx_study_sessions_deck on study_sessions (deck_id);
```

---

## 📁 Các file cần tạo / sửa

### Tạo mới

| File                                       | Mô tả                                            |
| ------------------------------------------ | ------------------------------------------------ |
| `src/app/(auth)/study/history/page.tsx`    | Server Component: trang lịch sử phiên học        |
| `src/app/(auth)/study/history/loading.tsx` | Skeleton loading                                 |
| `src/components/study/HistoryFilters.tsx`  | Client Component: deck select + period toggle    |
| `src/components/study/HistoryStatsRow.tsx` | Server Component: 3 summary stat cards           |
| `src/components/study/HistoryTable.tsx`    | Client Component: bảng chi tiết + pagination     |
| `src/components/study/SessionLabel.tsx`    | Badge component: Mới / Ôn tập / Chưa thuộc       |
| `src/components/study/Skeleton.tsx`        | Skeleton cho history page                        |
| `src/lib/data/history.ts`                  | Data fetching + Server Action `saveStudySession` |

### Sửa

| File                                         | Thay đổi                                                        |
| -------------------------------------------- | --------------------------------------------------------------- |
| `src/store/useStudyStore.ts`                 | Thêm `sessionStartedAt: Date \| null`, set trong `setSession()` |
| `src/app/(study)/study/[deckId]/session.tsx` | Thêm nút "Lịch sử" trong header → `/study/history`              |
| `src/components/study/SessionComplete.tsx`   | Gọi `saveStudySession` khi mount (useEffect + useRef)           |
| `src/app/(auth)/study/page.tsx`              | Thêm link "Xem lịch sử" hoặc tab navigation                     |

---

## 🏗️ Chi tiết kỹ thuật

### 1. Cập nhật `useStudyStore`

```typescript
interface StudyState {
  // ... existing fields ...
  sessionStartedAt: Date | null; // ← thêm mới
}

// Trong setSession():
setSession: (cards) =>
  set({ sessionCards: cards, currentIndex: 0, isFlipped: false,
        ratingStats: {}, sessionStartedAt: new Date() }),

// Trong reset():
reset: () => set({ ..., sessionStartedAt: null }),
```

### 2. Server Action `saveStudySession`

Đặt trong `src/lib/data/history.ts`:

```typescript
'use server';

export async function saveStudySession(payload: {
  deck_id: string;
  started_at: string; // ISO string
  ended_at: string; // ISO string
  duration_sec: number;
  cards_total: number;
  cards_reviewed: number;
  correct_count: number;
  mode: 'due' | 'review';
  rating_breakdown: { again: number; hard: number; good: number; easy: number };
}): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('study_sessions').insert({
    user_id: user.id,
    ...payload,
  });
}
```

### 3. Gọi `saveStudySession` trong `SessionComplete`

```typescript
'use client';

export default function SessionComplete({ deckId, mode, totalCards }: Props) {
  const { ratingStats, sessionStartedAt } = useStudyStore();
  const hasSaved = useRef(false);

  useEffect(() => {
    if (hasSaved.current || !sessionStartedAt) return;
    hasSaved.current = true;

    const endedAt = new Date();
    const good = ratingStats[3] ?? 0;
    const easy = ratingStats[4] ?? 0;
    const cardsReviewed = Object.values(ratingStats).reduce((a, b) => a + b, 0);

    saveStudySession({
      deck_id: deckId,
      started_at: sessionStartedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_sec: Math.round(
        (endedAt.getTime() - sessionStartedAt.getTime()) / 1000,
      ),
      cards_total: totalCards,
      cards_reviewed: cardsReviewed,
      correct_count: good + easy,
      mode,
      rating_breakdown: {
        again: ratingStats[1] ?? 0,
        hard: ratingStats[2] ?? 0,
        good,
        easy,
      },
    });
  }, []);

  // ... rest of component
}
```

> ⚠️ `hasSaved.current` ngăn double-save khi React StrictMode render 2 lần.

### 4. Data Fetching (`src/lib/data/history.ts`)

```typescript
// Lấy lịch sử + stats cho trang history
export async function getStudyHistory(
  userId: string,
  options: {
    deckId?: string; // undefined = tất cả
    period: 'week' | 'month' | 'all';
    page: number;
    limit: number;
  },
): Promise<{
  sessions: StudySessionRow[];
  total: number;
  stats: {
    total_time_sec: number;
    total_reviewed: number;
    avg_accuracy: number;
  };
  prev_stats: {
    total_time_sec: number;
    total_reviewed: number;
    avg_accuracy: number;
  } | null;
}>;

// Lấy danh sách deck của user (cho Select filter)
export async function getUserDecks(
  userId: string,
): Promise<{ id: string; name: string }[]>;
```

`StudySessionRow` là kết quả join `study_sessions ← decks`:

```typescript
type StudySessionRow = {
  id: string;
  deck_id: string;
  deck_name: string;
  deck_language: 'zh' | 'en';
  deck_description: string;
  started_at: string;
  duration_sec: number;
  cards_total: number;
  cards_reviewed: number;
  correct_count: number;
  mode: 'due' | 'review';
  rating_breakdown: { again: number; hard: number; good: number; easy: number };
};
```

**Tính period date range:**

```typescript
function getPeriodRange(period: 'week' | 'month' | 'all') {
  if (period === 'week')
    return {
      from: dayjs().startOf('week').toISOString(),
      to: dayjs().endOf('week').toISOString(),
    };
  if (period === 'month')
    return {
      from: dayjs().startOf('month').toISOString(),
      to: dayjs().endOf('month').toISOString(),
    };
  return null; // all — không filter
}
```

**Trend so sánh (tuần này vs tuần trước):**

```typescript
// prev_stats: cùng duration nhưng lùi 1 period
// Chỉ tính khi period = 'week' hoặc 'month'
const trendPercent = prev_stats?.total_reviewed
  ? Math.round(
      ((stats.total_reviewed - prev_stats.total_reviewed) /
        prev_stats.total_reviewed) *
        100,
    )
  : null;
```

### 5. Route & Pagination

- **URL pattern**: `/study/history?deck=<deckId>&period=week&page=1`
- `page.tsx` đọc `searchParams` → truyền vào `getStudyHistory`.
- `HistoryFilters` là Client Component, dùng `useRouter` + `useSearchParams` để update URL khi thay đổi filter.
- Pagination: `<` `>` buttons update `page` param, không reload page toàn bộ (`router.push` với shallow).

### 6. UI — `HistoryTable` (Client Component)

```
Bộ thẻ            Thời gian     Thời lượng  Thẻ đã ôn    Độ chính xác  Hành động
─────────────────── ──────────── ─────────── ──────────── ──────────── ──────────
[icon] Tên deck    Hôm nay 09:30  45 phút    42/50 [Mới]  ██████░ 92%  [Học lại]
       Mô tả deck  15 tháng 10
```

- Dùng shadcn `<Table>` + `<TableHeader>` + `<TableBody>` + `<TableRow>`.
- Icon ngôn ngữ: `🌐` (en) hoặc `文` trong badge cho zh.
- Accuracy bar: `<Progress>` với màu dynamic (emerald/amber/red).
- Nút "Học lại": `<Button size="sm">` → `href="/study/[deckId]"`.
- Footer pagination: `flex items-center justify-between`.

### 7. Summary Stats Row (`HistoryStatsRow`)

3 cards ngang, dùng shadcn `<Card>`:

```
┌────────────────────────┬────────────────────────┬────────────────────────┐
│ 📗 TỔNG THỜI GIAN HỌC │ 💳 SỐ THẺ ĐÃ ÔN        │ ✅ ĐỘ CHÍNH XÁC TB    │
│                        │                        │                        │
│  12.5 giờ              │  1,240 thẻ             │  94 %                  │
│  ████████████░░░░░     │  ↑ +12% so với trước   │  ████ ██ ██ ░░░░       │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

- CountUp animation (`<CountUp>`) cho mỗi số.
- Trend badge: `↑ +X%` emerald, `↓ -X%` red — chỉ hiện khi period = 'week' hoặc 'month'.
- Progress bar card 1: thanh emerald đơn.
- Progress bar card 3: phân đoạn (emerald = correct, amber = hard, red = again).

### 8. Navigation

Thêm tab/link "Lịch sử" vào trang `/study`:

```tsx
// src/app/(auth)/study/page.tsx
<div className="mb-6 flex items-center justify-between">
  <h1>Phiên học hôm nay</h1>
  <Link
    href="/study/history"
    className="text-sm text-emerald-600 hover:underline"
  >
    Xem lịch sử →
  </Link>
</div>
```

---

## 🎨 Design Tokens sử dụng

- `bg-surface-page` — nền trang
- `bg-white` — card nền
- `text-on-surface` — text chính
- `text-slate-400` — text muted
- `emerald-600` — label section
- `bg-emerald-50 text-emerald-600` — badge Ôn tập
- `bg-sky-50 text-sky-600` — badge Mới
- `bg-red-50 text-red-500` — badge Chưa thuộc

---

## ✅ Checklist

### Phase 1 – Database & Session Recording

- [x] Chạy migration SQL `study_sessions`
- [x] Thêm `sessionStartedAt` vào `useStudyStore`
- [x] Implement `saveStudySession` Server Action trong `src/lib/data/history.ts`
- [x] Cập nhật `SessionComplete` để gọi `saveStudySession` khi mount
- [x] Test: hoàn thành 1 phiên học → kiểm tra row trong Supabase

### Phase 2 – Data Fetching

- [x] Implement `getStudyHistory()` với filter period + deck + pagination
- [x] Implement `getUserDecks()` cho Select filter
- [x] Tính toán `prev_stats` để hiển thị trend

### Phase 3 – UI

- [x] `HistoryFilters` — Select + period toggle, sync với URL params
- [x] `HistoryStatsRow` — 3 stat cards với CountUp + trend badge
- [x] `SessionLabel` — badge Mới / Ôn tập / Chưa thuộc
- [x] `HistoryTable` — bảng + accuracy bar + pagination footer
- [x] `page.tsx` — Suspense + HistorySection (streaming, không dùng loading.tsx)
- [x] `HistorySection.tsx` — async Server Component gom filters + stats + table
- [x] `Skeleton.tsx` — skeleton tách riêng tại `src/components/study/Skeleton.tsx`
- [x] Link "Xem lịch sử" từ trang `/study`
- [x] Empty state khi chưa có session
- [x] Responsive: mobile hiển thị dạng card list thay bảng (breakpoint < md)
