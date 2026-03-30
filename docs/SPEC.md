# Spec: Emerald Flashcards - Spaced Repetition System (SRS)

## 1. Tổng quan (Overview)

- **Mục tiêu**: App học Flashcards đa ngôn ngữ (Trung - Anh - Việt) sử dụng thuật toán FSRS.
- **Ngôn ngữ hiển thị (UI)**: Tiếng Việt.
- **Nội dung học (Content)**: Tiếng Trung (kèm Pinyin), Tiếng Anh, Tiếng Việt (nghĩa).

---

## 2. Tech Stack & Dependencies

| Nhóm      | Package                                  | Mục đích                                          |
| --------- | ---------------------------------------- | ------------------------------------------------- |
| Framework | `next@16`, `react@19`                    | App Router, Server Components                     |
| UI        | `tailwindcss@4`, `shadcn`, `radix-ui`    | Component library                                 |
| Animation | `framer-motion@12`                       | Flip card, slide transitions                      |
| SRS Logic | `ts-fsrs@5`                              | Thuật toán Spaced Repetition                      |
| Backend   | `@supabase/supabase-js`, `@supabase/ssr` | Auth + Database (bắt buộc cho Next.js App Router) |
| State     | `zustand@5`                              | Client state management                           |
| Forms     | `react-hook-form`, `zod`                 | Form handling + schema validation                 |
| Utils     | `dayjs`, `clsx`, `tailwind-merge`        | Ngày giờ, class utilities                         |
| Misc      | `react-confetti`, `lucide-react`         | Confetti animation, icons                         |
| Nav       | `nextjs-toploader`                       | Top progress bar khi điều hướng                   |

**Dev dependencies quan trọng**:

- `prettier-plugin-tailwindcss` — tự động sắp xếp Tailwind class theo thứ tự chuẩn khi chạy `yarn format`.
- `eslint-plugin-import` — enforce import ordering theo nhóm + cấm duplicate imports.

**Prettier config** (`.prettierrc`): `singleQuote: true`, `semi: true`, `trailingComma: "all"`, `printWidth: 80`, `tabWidth: 2`.

> ⚠️ **Lưu ý**: Phải cài `@supabase/ssr` (không phải chỉ `@supabase/supabase-js`) để Supabase hoạt động đúng với Next.js App Router cookies.

- **MCP Integration**: Sử dụng **Context7** để truy xuất documentation mới nhất của Shadcn và Next.js 15 nhằm đảm bảo code không bị lỗi thời (legacy).

---

## 3. Cấu trúc dữ liệu (Data Schema)

### Interface `Deck`:

- `id`: uuid
- `user_id`: uuid (FK → auth.users)
- `name`: string
- `description`: string
- `language`: `'zh' | 'en'`
- `card_count`: number
- `due_count`: number (tính từ query, không lưu DB)
- `mastery_percent`: number (tính từ query, không lưu DB)
- `created_at`: timestamp (UTC)

### Interface `Flashcard`:

- `id`: uuid
- `deck_id`: uuid (FK → decks)
- `user_id`: uuid (FK → auth.users)
- `front`: string (Chữ Hán / Từ vựng Anh)
- `pinyin`: string (chỉ dùng khi `language = 'zh'`, để trống nếu không có; đối với EN card lưu chữ Trung tương ứng)
- `meaning_vn`: string (Nghĩa tiếng Việt)
- `meaning_en`: string (Nghĩa tiếng Anh, optional)
- `word_type?`: string (optional — loại từ: noun/verb/adj/adv/exclamation)
- `language`: `'zh' | 'en'`
- `examples`: `Array<{ cn: string, py: string, vn: string, en: string }>`
- `fsrs_data`: `FsrsData` (xem bên dưới)
- `next_review`: timestamp (UTC)
- `created_at`: timestamp (UTC)

### Interface `FsrsData` (FSRS default cho thẻ mới):

```typescript
{
  stability: 0,
  difficulty: 0,
  elapsed_days: 0,
  scheduled_days: 0,
  reps: 0,
  lapses: 0,
  state: 0,   // 0: New | 1: Learning | 2: Review | 3: Relearning
  last_review: null,
}
```

> Khi tạo thẻ mới, khởi tạo bằng `createEmptyCard()` từ `ts-fsrs` và set `next_review = now()`.

### Interface `StudySession`:

- `id`: uuid
- `user_id`: uuid (FK → auth.users)
- `deck_id`: uuid (FK → decks)
- `started_at`: timestamp (UTC) — khi bắt đầu session
- `ended_at`: timestamp (UTC) — khi `SessionComplete` render
- `duration_sec`: number — `ended_at - started_at` tính bằng giây
- `cards_total`: number — số thẻ trong queue lúc khởi tạo session
- `cards_reviewed`: number — số thẻ đã chấm điểm (không đếm lại khi bấm "Lại")
- `correct_count`: number — số thẻ được rating Good (3) hoặc Easy (4)
- `mode`: `'due' | 'review'` — `'due'` khi học thẻ đến hạn; `'review'` khi `?mode=review`
- `rating_breakdown`: `{ again: number; hard: number; good: number; easy: number }` — phân loại theo từng nút

**Computed fields (không lưu DB):**

- `accuracy_percent` = `correct_count / cards_reviewed * 100` (làm tròn)
- `session_label`: `'Chưa thuộc'` nếu accuracy < 70%; `'Ôn tập'` nếu mode='review'; `'Mới'` nếu mode='due'

---

## 4. Chức năng chính (Core Features)

### A. Authentication (Xác thực)

- **Đăng ký / Đăng nhập**: Email + Password qua Supabase Auth.
- **Provider**: Chỉ Email/Password (Google OAuth có thể thêm sau).
- **Routes bảo vệ**: Tất cả routes dưới `/(auth)` đều yêu cầu đăng nhập.
- **Middleware**: `src/proxy.ts` (chạy qua `middleware.ts`) dùng `@supabase/ssr` để refresh session, redirect về `/login` nếu chưa auth.
- **Validation schemas** (`src/lib/auth-schemas.ts`):
  - `loginSchema`: email (regex validate), password `min(6)`.
  - `registerSchema`: fullName, email, password `min(6)`, confirmPassword (`.refine` match check), agreeToTerms (`.refine` must be `true`).

#### Layout (unauth) — `src/app/(unauth)/layout.tsx`

- **Header** (fixed, frosted glass): `bg-white/80 backdrop-blur-xl` — icon Leaf + "Emerald Study" `text-emerald-700`.
- **Content**: `flex w-full max-w-110 flex-col gap-8` — narrow centered card stack.
- **Footer**: copyright © 2026 + 3 links (Điều khoản / Bảo mật / Liên hệ), `href="#"` placeholder.

#### `/login` — `src/app/(unauth)/login/page.tsx`

- **Client Component**, `useForm` + `zodResolver(loginSchema)`, `mode: 'all'`.
- **Form card**: shadcn `<Card>` + `<CardContent>` với `ring-0 shadow-[0_20px_40px_rgba(11,28,48,0.05)] bg-white`.
- **Tiêu đề**: "Chào mừng trở lại" (h2) + "Đăng nhập để tiếp tục hành trình học tập của bạn." (p).
- **Fields**:
  - Email — `<Input>` wrapped in `<FormField>`, label "Email".
  - Mật khẩu — `<PasswordInput>` với show/hide toggle, `<FormField>` có slot `labelRight` chứa link "Quên mật khẩu?" (`href="#"`).
- **Error banner**: `bg-red-50 border border-red-100 text-red-600 rounded-xl` — hiển thị khi `authError !== null`, text: "Email hoặc mật khẩu không đúng."
- **Submit button**: gradient `bg-linear-to-br from-brand-deep to-emerald-500`, disabled + `<Spinner>` khi `isSubmitting`.
- **Submit action**: `supabase.auth.signInWithPassword({ email, password })` → `router.replace('/dashboard')`.
- **Footer link**: "Chưa có tài khoản? **Đăng ký ngay**" → `/register`.

#### `/register` — `src/app/(unauth)/register/page.tsx`

- **Client Component**, `useForm` + `zodResolver(registerSchema)`, `mode: 'all'`.
- **Form card**: cùng style với `/login`.
- **Tiêu đề**: "Tạo tài khoản mới" (h2) + "Bắt đầu hành trình học tập với Emerald Study." (p).
- **Fields**:
  - Họ và tên — `<Input>`, label "Họ và tên".
  - Email — `<Input>`, label "Email".
  - Mật khẩu — `<PasswordInput>`, label "Mật khẩu".
  - Xác nhận mật khẩu — `<PasswordInput>`, label "Xác nhận mật khẩu".
  - Checkbox "Tôi đồng ý với **Điều khoản dịch vụ** và **Chính sách bảo mật**" — error text hiện bên dưới nếu chưa tick.
- **Error banner**: cùng style với `/login`.
- **Submit button**: cùng style gradient, disabled + `<Spinner>` khi `isSubmitting`.
- **Submit action**: `supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })` → `router.push('/dashboard')`.
- **Footer link**: "Đã có tài khoản? **Đăng nhập**" → `/login`.

**Redirect flows**:

- Sau login / register thành công: `→ /dashboard`.
- Sau logout: `→ /login`.
- Truy cập route auth khi chưa đăng nhập: `→ /login`.

### B. Dashboard (Bảng điều khiển)

- Widget **"Mục tiêu hôm nay"**: Progress Bar số thẻ đã học / tổng số thẻ cần ôn trong ngày.
- **StreakBanner**: Hiển thị chuỗi ngày học liên tiếp (streak) + câu động lực.
- Grid **"Bộ thẻ cần ôn"**: Mỗi card deck hiển thị badge số thẻ đến hạn (Due).
  - Due > 20: badge đỏ. Due 1–20: badge vàng. Due = 0: badge xanh.
  - Nút "Học ngay" (due > 0) hoặc "Xem thẻ" (due = 0).
- **StatsRow**: 4 chỉ số nhanh — Tổng thẻ, Đến hạn hôm nay, Thẻ mới, % Đã thuộc.
- **StreakBanner**: Hệ thống thứ hạng động 8 bậc (Học viên → Đồng → Bạc → Vàng → Kim Cương I/II/III → Master) dựa trên XP = streak × 30. Hiển thị tên bậc hiện tại + bậc tiếp theo.
- **ActivityFeed**: Danh sách hoạt động 2 ngày gần nhất (nhóm theo deck, tối đa 5 mục) với dấu chấm màu (cam/xanh) và thời gian tương đối.

### C. Phiên học tập (Study Session)

- **Trang danh sách** (`/study`): Server Component gọi `getDueDecks()`, chia thành "Cần ôn hôm nay" và "Đã hoàn thành — ôn lại nếu muốn". Nút "Học ngay" → `/study/[id]`; nút "Ôn lại" → `/study/[id]?mode=review`.
- **Khởi tạo session**: Load thẻ `next_review <= now()` (`getDueCards`) hoặc tất cả thẻ (`getAllCards` khi `mode=review`), xáo trộn, lưu vào `useStudyStore`.
- **Interaction**: Click thẻ để lật (Flip). Sau khi flip, hiển thị 4 nút chấm điểm.
- **Animation (Framer Motion)**:
  - Flip 3D: xoay 180° theo trục Y, `perspective: 1000px`, `transformStyle: preserve-3d`.
  - Chuyển thẻ: thẻ cũ slide-out sang trái, thẻ mới slide-in từ phải, dùng `AnimatePresence`.
- **Rating buttons** (hiện sau khi flip):

  | Nút | Rating      | Màu        | Interval gợi ý |
  | --- | ----------- | ---------- | -------------- |
  | Lại | `Again (1)` | Đỏ         | ~1 phút        |
  | Khó | `Hard (2)`  | Vàng       | ~2 ngày        |
  | Tốt | `Good (3)`  | Xanh dương | ~4 ngày        |
  | Dễ  | `Easy (4)`  | Emerald    | ~7 ngày        |

- **Queue logic**:
  - Khi nhấn **Lại (Again)**: thẻ được đẩy xuống **cuối queue** hiện tại (không kết thúc session).
  - Khi nhấn Khó/Tốt/Dễ: thẻ hoàn thành, chuyển thẻ tiếp theo.
  - Session kết thúc khi queue rỗng → hiển thị `SessionComplete`.
- **Logic FSRS**: Gọi `fsrs.next(card, rating)` → cập nhật `fsrs_data` + `next_review` lên Supabase.
- **Back-navigation**: `viewingIndex` state trong session cho phép xem lại thẻ đã học (read-only). Nút `<` `>` trong StudyHeader và phím `←` `→`. Khi đang xem lịch sử, RatingButtons bị ẩn.
- **SessionComplete**: Hiển thị confetti (`react-confetti`), thống kê breakdown theo rating từ `ratingStats`, nút **"Về Phiên học"** (`href="/study"`) và "Học lại bộ này".
- **Keyboard shortcuts** (desktop): `Space` = flip/unflip, `1/2/3/4` = rating, `←` / `→` = điều hướng lịch sử thẻ.

### D. Thư viện & Quản lý Deck (Library)

- **Library page** (`/library`): Grid tất cả decks của user, filter theo ngôn ngữ [Tất cả / Tiếng Trung / Tiếng Anh]. Streaming với `<Suspense>` cho từng section.
- **LibraryDecksSection**: Server Component async, render grid + empty state.
- **LibraryStatsSection**: Server Component async, render CTA gradient card + stats 2×2 tiles (CountUp animation).
- **Deck Detail page** (`/library/[deckId]`): Danh sách thẻ dạng bảng với sort/search, stats tổng quan.
- **Tạo deck mới**: Dialog inline trên Library page (tên, mô tả, ngôn ngữ). Toast thành công/thất bại.
- **Chỉnh sửa deck**: `EditDeckDialog` mở từ 3-dot dropdown menu trên card — prefilled form, gọi `updateDeck` Server Action. Toast kết quả.
- **Xóa deck**: Confirmation dialog từ 3-dot dropdown, toast kết quả. Xóa cascade tất cả thẻ trong deck.
- **Mutations** (`createDeck`, `updateDeck`, `deleteDeck`): Server Actions đặt trong `src/lib/data/library.ts` cùng với data fetching functions.
- **Loading overlay**: Khi `isPending = true` (đang gọi Server Action), hiển thị `<Loading />` từ `src/app/loading.tsx` — fixed backdrop blur + Spinner.

### E. Tìm kiếm & Sắp xếp (Search & Sort)

- Tìm kiếm theo `front` hoặc `meaning_vn` (client-side filtering).
- Lọc theo Chip: [Tất cả, Tiếng Trung, Tiếng Anh].
- Sắp xếp theo: Đến hạn sớm nhất, Mức độ thuộc (%), Tên A-Z, Tên Z-A.
- Filter state quản lý client-side bằng `useState` (không sync URL params — có thể thêm sau).

### F. Thêm & Chỉnh sửa thẻ (Add/Edit Card)

- **Add** (`/library/[deckId]/cards/new`): Form tạo thẻ mới với preview realtime bên phải, deck pre-selected theo URL.
- **Edit** (`/library/[deckId]/cards/[cardId]/edit`): Load card data, cho phép chỉnh sửa content fields (không reset `fsrs_data`).

### G. Lịch sử phiên học (Study History)

#### Lưu session khi hoàn thành

- `useStudyStore` thêm `sessionStartedAt: Date | null` — set khi `setSession()` được gọi.
- `SessionComplete` (client component) dùng `useEffect` + `useRef(false)` để gọi `saveStudySession` Server Action **đúng một lần** khi mount.
- `saveStudySession` nhận payload `StudySessionPayload` và insert vào bảng `study_sessions`.
- Nếu session bị interrupt (user đóng tab / back trước khi xong) → không lưu (acceptable loss).

#### Trang `/study/history`

- **Server Component** với `<Suspense>` cho stats row + table.
- **Filters (client-side state):**
  - Deck filter: shadcn `<Select>` — options "Tất cả bộ thẻ" + danh sách deck của user.
  - Period filter: toggle buttons "Tuần này" / "Tháng này" / "Tất cả".
- **Summary stats row** (3 cards):
  1. **Tổng thời gian học** — `sum(duration_sec) / 3600` → `XX giờ`, `<Progress>` emerald.
  2. **Số thẻ đã ôn** — `sum(cards_reviewed)`, trend so sánh với kỳ trước (±%).
  3. **Độ chính xác trung bình** — `avg(correct_count / cards_reviewed * 100)` → `XX%`, progress bar phân đoạn.
- **Bảng "Chi tiết phiên học"** — nút "Xuất báo cáo" (placeholder):

  | Cột          | Nội dung                                             |
  | ------------ | ---------------------------------------------------- |
  | Bộ thẻ       | Icon ngôn ngữ + tên deck + mô tả (truncated)         |
  | Thời gian    | `dayjs(started_at).format('HH:mm DD/MM')`            |
  | Thời lượng   | `duration_sec` → "X phút" / "X giờ Y phút"           |
  | Thẻ đã ôn    | `cards_reviewed/cards_total` + `session_label` badge |
  | Độ chính xác | Progress bar màu theo ngưỡng + `accuracy_percent%`   |
  | Hành động    | Nút "Học lại" → `/study/[deckId]`                    |

- **Badge màu `session_label`:**
  - `'Chưa thuộc'` → `bg-red-50 text-red-500`
  - `'Ôn tập'` → `bg-emerald-50 text-emerald-600`
  - `'Mới'` → `bg-sky-50 text-sky-600`
- **Progress bar màu độ chính xác:** ≥ 80% emerald, 60–79% amber, < 60% red.
- **Pagination**: server-side, `page` + `limit=10` qua URL search params. Footer: "Hiện thị X trong tổng số Y phiên học" + nút `<` `>`.
- **Empty state**: khi chưa có phiên học nào, hiển thị illustration + nút "Bắt đầu học".

### H. Thống kê (Statistics)

- **Trang `/thong-ke`** — Server Component với `<Suspense>` cho mỗi section.
- **Header section** (stats tổng quan — 4 cards):
  1. Tổng thời gian học (all-time)
  2. Tổng thẻ đã ôn (all-time)
  3. Streak hiện tại (ngày)
  4. Độ chính xác trung bình (all-time)
- **Heatmap học tập**: 52 tuần gần nhất (dạng GitHub contribution graph). Mỗi ô = 1 ngày. Màu intensity dựa trên `sum(cards_reviewed)`. Dùng CSS grid thuần, không cần thư viện ngoài. Tối đa 4 mức màu emerald.
- **Phân bổ FSRS state** (bar chart đơn giản bằng Tailwind + CSS):
  - 4 trạng thái: Mới (state=0), Đang học (state=1), Ôn tập (state=2), Học lại (state=3).
  - Mỗi state = 1 row với label + số thẻ + bar rộng tỉ lệ.
- **Thống kê theo bộ thẻ** (table):
  - Columns: Tên deck | Tổng thẻ | Đã thuộc % | Tổng phiên học | Độ chính xác TB | Lần học cuối.
  - Sort: mặc định theo "Lần học cuối" giảm dần.
- **Data fetching** (`src/lib/data/statistics.ts`):
  - `getOverallStats(userId)`: tổng hợp từ `study_sessions` + `flashcards` + `decks`.
  - `getActivityHeatmap(userId)`: `study_sessions` nhóm theo ngày, 365 ngày gần nhất.
  - `getFsrsStateBreakdown(userId)`: count flashcards theo `fsrs_data->>'state'`.
  - `getDeckStats(userId)`: join `decks` + `flashcards` + `study_sessions`.
- **Delete**: Confirmation dialog trong trang Edit, redirect về `/library/[deckId]/cards` sau khi xóa.
- Form validation bằng `zod` + `react-hook-form` (`mode: 'all'`, `reValidateMode: 'onChange'`), lỗi hiển thị inline bằng tiếng Việt.
- Examples: tối đa 5, dùng `useFieldArray`.
  - ZH examples: `cn`, `py`, `vn` **required**; `en` optional.
  - EN examples: `en`, `vn` **required**; `cn` optional; `py` hidden (không hiển thị).
- **Word type chip**: chọn loại từ (Danh từ / Động từ / Tính từ / Trạng từ / Thán từ) — optional, color-coded.
- **Độ khó ban đầu**: selector 3 bậc (Dễ / Trung bình / Khó) khi tạo thẻ mới. Ở chế độ edit, FSRS tự động điều chỉnh (không hiện selector).
- **Validation schema**: `createCardSchema(language)` — dynamic schema theo ngôn ngữ (zh/en). ZH: `pinyin` required; EN: `pinyin` optional.
- **Preview**: 3D flip card inline CSS, không dùng Framer Motion (dùng `transform: rotateY`).
  - Front: gradient xanh lá, chữ to + pinyin + meanings.
  - Back: nền trắng, danh sách examples với TTS (Web Speech API).
- **TTS** (Text-to-Speech): icon 🔊 trên mặt trước và trên mỗi example. Gọi `window.speechSynthesis.speak()`.

---

## 5. Supabase Database Schema

### Table: `decks`

```sql
create table decks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text default '',
  language    text not null check (language in ('zh', 'en')),
  created_at  timestamptz default now()
);

alter table decks enable row level security;
create policy "Users manage own decks"
  on decks for all using (auth.uid() = user_id);
```

### Table: `flashcards`

```sql
create table flashcards (
  id           uuid primary key default gen_random_uuid(),
  deck_id      uuid not null references decks(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  language     text not null check (language in ('zh', 'en')),
  front        text not null,
  pinyin       text default '',
  meaning_vn   text not null,
  meaning_en   text default '',
  word_type    text,
  examples     jsonb default '[]'::jsonb,
  fsrs_data    jsonb not null default '{
    "stability": 0, "difficulty": 0, "elapsed_days": 0,
    "scheduled_days": 0, "reps": 0, "lapses": 0,
    "state": 0, "last_review": null
  }'::jsonb,
  next_review  timestamptz default now(),
  created_at   timestamptz default now()
);

-- Migration (nếu table đã tồn tại):
-- ALTER TABLE flashcards ADD COLUMN word_type text;

alter table flashcards enable row level security;
create policy "Users manage own flashcards"
  on flashcards for all using (auth.uid() = user_id);
```

### Table: `study_sessions`

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
```

> Index gợi ý để tăng tốc query lịch sử và thống kê:
>
> ```sql
> create index idx_study_sessions_user_started on study_sessions (user_id, started_at desc);
> create index idx_study_sessions_deck on study_sessions (deck_id);
> ```

---

## 6. Route Map

```
/                                               → redirect → /dashboard (nếu đã login) hoặc /login
/login                                          → Trang đăng nhập
/register                                       → Trang đăng ký
/(auth)                                         → Route group bảo vệ (yêu cầu auth) + AppShell
  /dashboard                                    → Bảng điều khiển
  /library                                      → Thư viện tất cả decks
  /library/[deckId]/cards                       → Chi tiết 1 deck + danh sách thẻ (bảng)
  /library/[deckId]/cards/new                   → Thêm thẻ mới
  /library/[deckId]/cards/[cardId]/edit         → Chỉnh sửa thẻ
  /study                                        → Danh sách phiên học hôm nay
/(study)                                        → Route group full-screen (không AppShell)
  /study/[deckId]                               → Phiên học tập
  /study/[deckId]?mode=review                   → Ôn lại toàn bộ thẻ (kể cả đã thuộc)
/(auth)
  /study/history                                → Lịch sử phiên học (có AppShell)
  /thong-ke                                     → Thống kê tổng quan
```

---

## 7. Design System

### Màu sắc (Color Palette)

Màu được khai báo trong `src/app/globals.css` dưới `@theme inline` (Tailwind v4 CSS-first). Dùng **Tailwind class** thay vì giá trị hex thô.

#### Custom tokens (khai báo trong `globals.css`):

| CSS Variable            | Tailwind class     | Dùng cho                     |
| ----------------------- | ------------------ | ---------------------------- |
| `--color-surface-page`  | `bg-surface-page`  | Nền trang (page background)  |
| `--color-surface-input` | `bg-surface-input` | Nền input / chip             |
| `--color-on-surface`    | `text-on-surface`  | Văn bản chính (primary text) |
| `--color-on-muted`      | `text-on-muted`    | Văn bản phụ (secondary text) |
| `--color-brand-deep`    | `from-brand-deep`  | Gradient start (deep green)  |
| `--color-rating-again`  | `bg-rating-again`  | Nút "Lại"                    |
| `--color-rating-hard`   | `bg-rating-hard`   | Nút "Khó"                    |
| `--color-rating-good`   | `bg-rating-good`   | Nút "Tốt"                    |
| `--color-rating-easy`   | `bg-rating-easy`   | Nút "Dễ"                     |

#### Tailwind Emerald scale (dùng trực tiếp):

| Class            | Dùng cho                              |
| ---------------- | ------------------------------------- |
| `bg-emerald-500` | Primary buttons, badges, progress bar |
| `bg-emerald-600` | Primary hover                         |
| `bg-emerald-100` | Badge background, chip active         |
| `bg-emerald-950` | Sidebar dark background               |

> **Quy tắc**: Luôn dùng token/class (`bg-surface-page`) — **không** hardcode hex (`bg-[#eff4ff]`).`

### Typography

- **Font chính**: `Inter` (Latin), `Noto Sans SC` (tiếng Trung).
- **Chữ Hán trên thẻ học**: `font-size: clamp(48px, 10vw, 80px)`, `font-weight: 300`.
- **Pinyin**: `font-size: 18px`, màu `--muted-foreground`.

---

## 8. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

> Không cần `SUPABASE_SERVICE_ROLE_KEY` vì dùng RLS thay vì service role.

---

## 9. Quy tắc phát triển (Development Rules)

- **Zustand Store**: `useStudyStore` quản lý `isFlipped`, `currentIndex`, `sessionCards`, `ratingStats`, actions `flipCard()`, `unflipCard()`, `rateCard(rating)`, `setSession()`, `reset()`. `useUIStore` quản lý sidebar state.
- **Server Components**: Ưu tiên fetching dữ liệu ở Server Component, chỉ dùng Client Component khi cần interactivity.
- **Server Actions**: Dùng cho mutations (create/update/delete card, deck) thay vì API routes.
- **Form Validation**: Dùng `zod` schema + `react-hook-form`, error message bằng **tiếng Việt**.
- **Mobile First**: Sidebar Desktop → Bottom Nav Mobile (breakpoint `md: 768px`).
- **Error Handling**: Toast (Shadcn Sonner) cho success/error. Error boundary cho lỗi render.
- **Loading States**: Dùng `loading.tsx` ở mỗi route segment hoặc `<Suspense>` + skeleton components. Component `Spinner` (`src/components/ui/spinner.tsx`) dùng chung, màu `emerald-500`. Khi gọi Server Action từ dialog/form, import `Loading` từ `src/app/loading.tsx` và render khi `isPending = true`.
- **shadcn/ui Priority**: Ưu tiên dùng shadcn component thay vì nhúng raw HTML + Tailwind. Trước khi viết `<select>`, `<input>`, `<button>`, `<textarea>`, kiểm tra xem shadcn có component tương ứng không (`Select`, `Input`, `Button`, `Textarea`, `DropdownMenu`, `Dialog`…). Cài thêm component: `npx shadcn@latest add <component-name>`.
- **Date/Time**: Dùng `dayjs` cho mọi thao tác ngày giờ. Lưu UTC trong DB, hiển thị local timezone.
- **RLS**: Mọi query phải đi qua RLS — không dùng `service_role` key ở client.
- **Styling**: Không hardcode màu hex — dùng Tailwind token (`bg-surface-page`) hoặc Emerald scale (`bg-emerald-500`). Không dùng inline styles.
- **React 19**: `forwardRef` không cần thiết — truyền `ref` trực tiếp như prop thông thường. React Compiler đã bật — không cần `useMemo`/`useCallback` thủ công trừ khi profiling chỉ ra vấn đề.
- **Shared components**: Đặt ở `src/components/ui/` — không tạo folder theo feature (`auth/`, `dashboard/`).
- **Constants**: Hằng số dùng chung đặt ở `src/constants/index.ts` (e.g. `RANKS`, `LANGUAGE_LABELS`, `XP_PER_STREAK_DAY`).
- **Utilities**: Pure functions dùng chung đặt ở `src/utils/index.ts` (e.g. `getRank()`, `getProgressColor()`). Không lặp lại logic này inline trong component.
- **Tailwind class ordering**: `prettier-plugin-tailwindcss` tự động sắp xếp class khi chạy `yarn format`. Không cần sắp xếp thủ công.
- **Import ordering**: ESLint rule `import/order` (từ `eslint-plugin-import`) tự động enforce thứ tự import theo nhóm:
  1. `builtin` (fs, path…)
  2. `external` (react, next, thư viện npm)
  3. `internal` (alias `@/…`)
  4. `parent` / `sibling` (`../`, `./`)
  5. `index`, `object`, `type`

  Mỗi nhóm cách nhau 1 dòng trống. Trong nhóm sắp xếp A-Z. Chạy `yarn lint --fix` để tự sửa. Rule `import/no-duplicates` cấm import trùng.

---

## 10. Prompting Guide cho Copilot Agent

- Khi gen UI: "Dựa vào SPEC.md, hãy dùng Shadcn và Framer Motion để tạo component X bám sát thiết kế Emerald."
- Khi sửa logic: "Cập nhật logic rateCard trong Store dựa trên thuật toán FSRS được mô tả trong SPEC.md."
- Khi tạo Supabase query: "Tham khảo Section 5 trong SPEC.md để viết query đúng schema, có RLS."
- Khi tạo form: "Dùng react-hook-form + zod theo SPEC.md Section 9, validation message tiếng Việt."
