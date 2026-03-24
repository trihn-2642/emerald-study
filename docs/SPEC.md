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
- `pinyin`: string (chỉ dùng khi `language = 'zh'`, để trống nếu không có)
- `meaning_vn`: string (Nghĩa tiếng Việt)
- `meaning_en`: string (Nghĩa tiếng Anh, optional)
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

---

## 4. Chức năng chính (Core Features)

### A. Authentication (Xác thực)

- **Đăng ký / Đăng nhập**: Email + Password qua Supabase Auth.
- **Provider**: Chỉ Email/Password (Google OAuth có thể thêm sau).
- **Routes bảo vệ**: Tất cả routes dưới `/(unth)` đều yêu cầu đăng nhập.
- **Middleware**: `middleware.ts` ở root dùng `@supabase/ssr` để refresh session, redirect về `/login` nếu chưa auth.
- **Pages**:
  - `/login` — Form đăng nhập, link sang đăng ký.
  - `/register` — Form đăng ký, tự động đăng nhập sau khi tạo tài khoản.
  - Redirect sau login: `→ /dashboard`.
  - Redirect sau logout: `→ /login`.

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

- **Khởi tạo session**: Load tất cả thẻ có `next_review <= now()` của deck, xáo trộn, lưu vào `useStudyStore`.
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
- **SessionComplete**: Hiển thị confetti (`react-confetti`), thống kê breakdown theo rating, nút "Về Dashboard" và "Học lại".
- **Keyboard shortcuts** (desktop): `Space` = flip, `1/2/3/4` = rating.

### D. Thư viện & Quản lý Deck (Library)

- **Library page** (`/library`): Grid tất cả decks của user, filter theo ngôn ngữ [Tất cả / Tiếng Trung / Tiếng Anh].
- **Deck Detail page** (`/library/[deckId]`): Danh sách thẻ dạng bảng với sort/search, stats tổng quan.
- **Tạo deck mới**: Dialog inline trên Library page (tên, mô tả, ngôn ngữ).
- **Xóa deck**: Confirmation dialog, xóa cascade tất cả thẻ trong deck.

### E. Tìm kiếm & Sắp xếp (Search & Sort)

- Tìm kiếm theo `front` hoặc `meaning_vn` (client-side filtering).
- Lọc theo Chip: [Tất cả, Tiếng Trung, Tiếng Anh].
- Sắp xếp theo: Đến hạn sớm nhất, Mức độ thuộc (%), Mới nhất.
- Filter state sync với URL search params (`?q=&lang=&sort=`).

### F. Thêm & Chỉnh sửa thẻ (Add/Edit Card)

- **Add** (`/cards/new`): Form tạo thẻ mới với preview realtime bên phải.
- **Edit** (`/cards/[cardId]/edit`): Load card data, cho phép chỉnh sửa content fields (không reset `fsrs_data`).
- **Delete**: Confirmation dialog trong trang Edit, redirect về `/library/[deckId]` sau khi xóa.
- Form validation bằng `zod` + `react-hook-form`, lỗi hiển thị inline bằng tiếng Việt.
- Examples: tối đa 5, dùng `useFieldArray` từ `react-hook-form`.

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
  examples     jsonb default '[]'::jsonb,
  fsrs_data    jsonb not null default '{
    "stability": 0, "difficulty": 0, "elapsed_days": 0,
    "scheduled_days": 0, "reps": 0, "lapses": 0,
    "state": 0, "last_review": null
  }'::jsonb,
  next_review  timestamptz default now(),
  created_at   timestamptz default now()
);

alter table flashcards enable row level security;
create policy "Users manage own flashcards"
  on flashcards for all using (auth.uid() = user_id);
```

---

## 6. Route Map

```
/                       → redirect → /dashboard (nếu đã login) hoặc /login
/login                  → Trang đăng nhập
/register               → Trang đăng ký
/(unth)                  → Route group bảo vệ (yêu cầu auth)
  /dashboard            → Bảng điều khiển
  /library              → Thư viện tất cả decks
  /library/[deckId]     → Chi tiết 1 deck + danh sách thẻ
  /study/[deckId]       → Phiên học tập
  /cards/new            → Thêm thẻ mới
  /cards/[cardId]/edit  → Chỉnh sửa thẻ
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

- **Zustand Store**: `useStudyStore` quản lý `isFlipped`, `currentIndex`, `sessionCards`, action `rateCard(rating)`. `useUIStore` quản lý sidebar state.
- **Server Components**: Ưu tiên fetching dữ liệu ở Server Component, chỉ dùng Client Component khi cần interactivity.
- **Server Actions**: Dùng cho mutations (create/update/delete card, deck) thay vì API routes.
- **Form Validation**: Dùng `zod` schema + `react-hook-form`, error message bằng **tiếng Việt**.
- **Mobile First**: Sidebar Desktop → Bottom Nav Mobile (breakpoint `md: 768px`).
- **Error Handling**: Toast (Shadcn Sonner) cho success/error. Error boundary cho lỗi render.
- **Loading States**: Dùng `loading.tsx` ở mỗi route segment hoặc `<Suspense>` + skeleton components. Component `Spinner` (`src/components/ui/spinner.tsx`) dùng chung, màu `emerald-500`.
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
