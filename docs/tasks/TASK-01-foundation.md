# Task 01: Foundation – Thiết lập nền tảng dự án

## 🎯 Mục tiêu

Thiết lập toàn bộ nền tảng kỹ thuật cho dự án: kiến trúc thư mục, type definitions, Supabase client, Zustand store, và layout chính với Sidebar/Bottom Nav responsive.

---

## 📁 Các file cần tạo / sửa

### Tạo mới

| File                                   | Mô tả                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/types/flashcard.ts`               | TypeScript interfaces: `Flashcard`, `Deck`, `FsrsData`, `Example`                  |
| `src/types/index.ts`                   | Re-export tất cả types                                                             |
| `src/lib/supabase/client.ts`           | Supabase browser client (`createBrowserClient`)                                    |
| `src/lib/supabase/server.ts`           | Supabase server client (`createServerClient`) + `getUser()` cache                  |
| `src/lib/supabase/middleware.ts`       | Supabase middleware helper                                                         |
| `src/store/useStudyStore.ts`           | Zustand store: `isFlipped`, `currentIndex`, `sessionCards`, actions                |
| `src/store/useUIStore.ts`              | Zustand store: trạng thái UI toàn cục (sidebar open/close, theme)                  |
| `src/components/layout/Sidebar.tsx`    | Sidebar navigation cho Desktop (4 items: Trang chủ, Thư viện, Phiên học, Thống kê) |
| `src/components/layout/BottomNav.tsx`  | Bottom navigation cho Mobile (4 tabs)                                              |
| `src/components/layout/AppShell.tsx`   | Layout wrapper: Sidebar + BottomNav + sticky header + UserMenu                     |
| `src/components/layout/UserMenu.tsx`   | Dropdown user menu: avatar initials, tên, email, Đăng xuất                         |
| `src/components/ui/form-field.tsx`     | Form field wrapper (label + error) dùng chung mọi màn hình                         |
| `src/components/ui/password-input.tsx` | Input mật khẩu có toggle hiện/ẩn, React 19 (không dùng forwardRef)                 |
| `src/components/ui/spinner.tsx`        | Spinner component dùng chung, màu `emerald-500`                                    |
| `src/constants/index.ts`               | Hằng số dùng chung: `RANKS`, `XP_PER_STREAK_DAY`, `LANGUAGE_LABELS`                |
| `src/utils/index.ts`                   | Utility functions: `getRank(xp)`, `getProgressColor(percent)`                      |
| `src/app/(auth)/layout.tsx`            | Protected route group layout sử dụng AppShell, auth guard                          |
| `src/app/(auth)/page.tsx`              | Redirect về `/dashboard`                                                           |
| `src/app/loading.tsx`                  | Global loading spinner khi điều hướng                                              |
| `src/app/(unauth)/layout.tsx`          | Layout trang auth: centered, không sidebar                                         |
| `src/app/(unauth)/login/page.tsx`      | Trang đăng nhập: form email + password, link sang `/register`                      |
| `src/app/(unauth)/register/page.tsx`   | Trang đăng ký: form tạo tài khoản, tự login sau khi tạo xong                       |
| `src/proxy.ts`                         | File thực thi chính của Next.js 16, gọi hàm từ thư mục lib ở trên.                 |
| `.env.local.example`                   | Template biến môi trường Supabase                                                  |

### Sửa

| File                  | Thay đổi                                                             |
| --------------------- | -------------------------------------------------------------------- |
| `src/app/layout.tsx`  | Cập nhật metadata: title "Emerald Flashcards"                        |
| `src/app/globals.css` | Thêm custom color tokens vào `@theme inline` (Tailwind v4 CSS-first) |

---

## 🏗️ Chi tiết kỹ thuật

### `src/types/flashcard.ts`

```typescript
export interface FsrsData {
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number; // 0: New | 1: Learning | 2: Review | 3: Relearning
  last_review: string | null; // ISO timestamp UTC
}

export interface Example {
  cn: string;
  py: string;
  vn: string;
  en: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  user_id: string;
  front: string;
  pinyin: string;
  meaning_vn: string;
  meaning_en: string;
  examples: Example[];
  fsrs_data: FsrsData;
  next_review: string; // ISO timestamp UTC
  created_at: string;
  language: 'zh' | 'en';
}

export interface Deck {
  id: string;
  user_id: string;
  name: string;
  description: string;
  language: 'zh' | 'en';
  card_count: number;
  due_count: number;
  mastery_percent: number;
  created_at: string;
}
```

### Sidebar Navigation Items

- 🏠 Trang chủ → `/dashboard`
- 📚 Thư viện → `/library`
- 🎓 Phiên học → `/study`
- 📊 Thống kê → `/stats`

### Màu Emerald Theme (`src/app/globals.css` — `@theme inline`)

Tailwind v4 dùng CSS-first config (không có `tailwind.config.ts`). Thêm token vào `@theme inline` trong `globals.css`:

```css
@theme inline {
  /* Custom surface & text colours */
  --color-surface-page: #eff4ff; /* bg-surface-page  */
  --color-surface-input: #e5eeff; /* bg-surface-input */
  --color-on-surface: #0b1c30; /* text-on-surface  */
  --color-on-muted: #3c4a42; /* text-on-muted    */
  --color-brand-deep: #006c49; /* from-brand-deep  */

  /* Rating colours */
  --color-rating-again: #ef4444; /* bg-rating-again  */
  --color-rating-hard: #f59e0b; /* bg-rating-hard   */
  --color-rating-good: #3b82f6; /* bg-rating-good   */
  --color-rating-easy: #10b981; /* bg-rating-easy   */
}
```

Dùng trực tiếp như Tailwind class: `bg-surface-page`, `text-on-surface`, `from-brand-deep`, `bg-rating-again`, ...
Chỉ dùng thêm Tailwind Emerald scale theo nhu cầu: `emerald-500`, `emerald-600`, `emerald-100`, `emerald-950`.

---

## ✅ Checklist hoàn thành

### Cài đặt Packages

- [x] `@supabase/ssr` đã cài: `yarn add @supabase/ssr`
- [x] `react-hook-form` đã cài: `yarn add react-hook-form`
- [x] `zod` đã cài: `yarn add zod`
- [x] `nextjs-toploader` đã cài — top progress bar khi điều hướng
- [x] `prettier-plugin-tailwindcss` đã cài (devDep) — `yarn format` tự sắp xếp Tailwind classes
- [x] `eslint-plugin-import` đã cài (devDep) — `import/order` enforce nhóm import, `import/no-duplicates` cấm trùng
- [x] `.prettierrc` cấu hình: `singleQuote`, `semi`, `trailingComma: "all"`, `printWidth: 80`
- [x] `.prettierignore` loại trừ: `.next/`, `node_modules/`, `public/`, `*.config.*`, lockfiles

### Types & Config

- [x] `Flashcard` interface đủ tất cả fields theo SPEC
- [x] `Deck` interface có `due_count` và `mastery_percent`
- [x] `.env.local.example` có `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase

- [x] `client.ts` dùng `@supabase/ssr` `createBrowserClient` (không phải `@supabase/supabase-js` trực tiếp)
- [x] `server.ts` dùng `@supabase/ssr` `createServerClient` + Next.js `cookies()`
- [x] `src/proxy.ts` gọi hàm refresh session từ `middleware` helper refresh session và protect routes `/dashboard`, `/library`, `/cards`

### Zustand Store

- [x] `useStudyStore` có state: `isFlipped`, `currentIndex`, `sessionCards: Flashcard[]`
- [x] `useStudyStore` có actions: `flipCard()`, `nextCard()`, `setSession(cards)`, `reset()`
- [x] `useUIStore` có state: `isSidebarOpen`, actions: `toggleSidebar()`

### Layout & Components

- [x] `AppShell` render `Sidebar` trên `md+` và `BottomNav` trên `< md`
- [x] `Sidebar` có logo "Emerald Study" với icon lá màu xanh
- [x] `Sidebar` highlight active route
- [x] `BottomNav` có 4 icon tabs tương ứng với nav items
- [x] Route group `(auth)` áp dụng `AppShell` layout
- [x] `proxy.ts` được đặt tại src/proxy.ts
- [x] `FormField` (`src/components/ui/form-field.tsx`) — dùng chung, không phụ thuộc vào folder `auth/`
- [x] `PasswordInput` (`src/components/ui/password-input.tsx`) — React 19 (không dùng `forwardRef`), dùng shadcn `Input` nội tại
- [x] Auth pages dùng shadcn `Card` + `CardContent`, `Input`, `Button` thay cho raw HTML elements

### Visual

- [x] CSS variables emerald được khai báo trong `globals.css`
- [x] `Spinner` (`src/components/ui/spinner.tsx`) — spin xanh `emerald-500`, dùng chung
- [x] `loading.tsx` ở `(auth)/` và `(unauth)/` hiển thị spinner khi điều hướng
- [x] App render không lỗi tại `http://localhost:3000`

---

## 📐 Quy ước UI

- Trang auth dùng `bg-surface-page` (nền), `text-on-surface` (text chính), `text-on-muted` (text phụ)
- Input trên màn auth: shadcn `<Input>` với `className="h-auto py-3.5 px-4 bg-surface-input border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 text-on-surface placeholder:text-slate-300"`
- Submit button trên màn auth: shadcn `<Button>` với `className="w-full h-auto py-4 bg-linear-to-br from-brand-deep to-emerald-500 text-white font-semibold shadow-sm hover:opacity-90"`
- Form card: shadcn `<Card>` + `<CardContent>` với `className="ring-0 shadow-[0_20px_40px_rgba(11,28,48,0.05)] bg-white"`
- Shared components đặt ở `src/components/ui/` — không tạo folder feature-specific (`auth/`, `dashboard/`)
- **Không** hardcode màu hex — luôn dùng Tailwind token hoặc Emerald scale
