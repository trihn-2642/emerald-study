# GitHub Copilot Instructions – Emerald Study

## Project Overview

Emerald Study là ứng dụng học Flashcard SRS (Spaced Repetition System) đa ngôn ngữ (Trung–Anh–Việt) xây dựng trên Next.js + React 19. Sử dụng thuật toán FSRS via `ts-fsrs`, Supabase cho auth & database, và shadcn/ui cho component library.

---

## Tech Stack

- **Next.js 16 + React 19** with TypeScript — App Router, Server Components, Server Actions
- **React Compiler** enabled (`reactCompiler: true` in `next.config.ts`) — no manual memoization needed
- **Tailwind CSS v4** — CSS-first config via `@import "tailwindcss"` in `globals.css` (no `tailwind.config.ts`)
- **shadcn/ui** ("new-york" style) — components in `src/components/ui/`, built on Radix UI
- **Zustand v5** — client state (`useStudyStore`, `useUIStore`)
- **React Hook Form + Zod** — form handling + schema validation
- **@supabase/ssr** — Auth + Database for Next.js App Router cookies
- **ts-fsrs v5** — FSRS spaced repetition algorithm
- **Framer Motion v12** — flip card + slide transitions
- **Lucide React** — icons
- **dayjs** — date/time utilities

---

## UI Component System (shadcn/ui)

Components are copied to `src/components/ui/`, not installed as npm dependencies.

**Adding components:** `yarn dlx shadcn@latest add <component-name>`

**Key config:** Style: "new-york" | CSS Variables: enabled | Icons: Lucide | Aliases: `@/components`, `@/lib/utils`

---

## Project Structure

```
src/
  app/
    (unauth)/           # Login / Register — no sidebar, centered layout
    (auth)/             # Protected routes — AppShell with Sidebar + BottomNav
  components/
    layout/             # AppShell, Sidebar, BottomNav
    ui/                 # shadcn/ui primitives + custom shared components
  lib/
    supabase/           # client.ts, server.ts, middleware.ts
    utils.ts            # cn() utility
  store/                # Zustand stores (useStudyStore, useUIStore)
  types/                # TypeScript interfaces (Flashcard, Deck, FsrsData)
docs/
  SPEC.md               # Full product specification
  tasks/                # Per-task implementation guides
```

---

## Code Style & Conventions

### Naming Conventions

- **Components:** PascalCase — `DeckCard`, `StudySession`, `AppShell`
- **Files:** PascalCase for component files, kebab-case for everything else
- **Types/Interfaces:** PascalCase without prefix — `Flashcard`, `Deck`, `FsrsData`
- **Type aliases (unions/primitives):** `TTypeName` — `TLanguage`, `TRating`
- **Hooks:** `useHookName` — `useStudyStore`, `useUIStore`
- **Handlers:** `handleEventName` — `handleClick`, `handleSubmit`

### Import Order

1. React / external libraries
2. Next.js (`next/navigation`, `next/link`, `next/image`)
3. UI components (`@/components/ui/...`, `@/components/layout/...`)
4. Lib / utils (`@/lib/...`)
5. Stores (`@/store/...`)
6. Types (`@/types/...`)
7. Relative imports

```typescript
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useStudyStore } from '@/store/useStudyStore';
import type { Flashcard } from '@/types';
```

### Export Pattern

- **UI components** → named exports: `export { Button }`
- **Page / layout components** → default exports: `export default DashboardPage`
- **Utilities / hooks / stores** → named exports
- **Types** → named exports: `export type { Flashcard }`

### TypeScript Patterns

```typescript
// Props: use type
type Props = {
  card: Flashcard;
  onRate: (rating: number) => void;
};

// Data shapes / API contracts: use interface
interface Flashcard {
  id: string;
  front: string;
  // ...
}

// Unions / primitives
type TLanguage = 'zh' | 'en';
type TRating = 1 | 2 | 3 | 4;

// Extract from Zod schema
type LoginFormValues = z.infer<typeof loginSchema>;

// Native HTML element props
type InputProps = React.ComponentProps<'input'>;
```

**No `any` types.** Use proper TypeScript types always.

### Component Structure

```typescript
type Props = {
  /* ... */
};

function ComponentName({ prop1, prop2 }: Props) {
  // 1. Hooks (state, refs, custom hooks)
  // 2. Derived values
  // 3. Event handlers
  // 4. Effects
  // 5. Render
  return <div>...</div>;
}

export { ComponentName }; // named for UI components
export default ComponentName; // default for pages
```

---

## Styling

### Tailwind CSS v4 — CSS-first

No `tailwind.config.ts`. All theme tokens defined in `src/app/globals.css` under `@theme inline`.

**Custom tokens — use these classes, never hardcode hex values:**

| Tailwind class     | Value     | Usage                       |
| ------------------ | --------- | --------------------------- |
| `bg-surface-page`  | `#eff4ff` | Page / screen background    |
| `bg-surface-input` | `#e5eeff` | Input / chip background     |
| `text-on-surface`  | `#0b1c30` | Primary text                |
| `text-on-muted`    | `#3c4a42` | Secondary / muted text      |
| `from-brand-deep`  | `#006c49` | Gradient start — deep green |
| `bg-rating-again`  | `#ef4444` | "Again" rating button       |
| `bg-rating-hard`   | `#f59e0b` | "Hard" rating button        |
| `bg-rating-good`   | `#3b82f6` | "Good" rating button        |
| `bg-rating-easy`   | `#10b981` | "Easy" rating button        |

**Tailwind Emerald scale (use directly):** `emerald-100`, `emerald-500`, `emerald-600`, `emerald-950`

> ✅ `bg-surface-page` | ❌ `bg-[#eff4ff]`
> ✅ `text-emerald-700` | ❌ `text-[#059669]`

### cn() Utility

Always use `cn()` from `@/lib/utils`:

```typescript
cn('base', isActive && 'active');
cn('base', { active: isActive, disabled: isDisabled });
cn(variants({ variant, size }), className);
```

### Data Attributes Pattern

shadcn components use `data-slot` and `data-*` for styling hooks:

```tsx
<button data-slot="button" data-variant={variant} />
<Input aria-invalid={!!error} className="aria-invalid:border-destructive" />
```

---

## Supabase Patterns

```typescript
// Client component
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Server Component / Server Action
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

- Always use `@supabase/ssr` — not `@supabase/supabase-js` directly in App Router
- All queries go through RLS — never use `service_role` key client-side
- Mutations → Server Actions (not API routes)

---

## Zustand Store Patterns

```typescript
'use client';
import { useStudyStore } from '@/store/useStudyStore';

const { sessionCards, currentIndex, isFlipped, flipCard, nextCard } =
  useStudyStore();
```

- `useStudyStore`: `isFlipped`, `currentIndex`, `sessionCards`, `flipCard()`, `nextCard()`, `setSession()`, `reset()`
- `useUIStore`: `isSidebarOpen`, `toggleSidebar()`

---

## Form Patterns

```typescript
const schema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
});
type FormValues = z.infer<typeof schema>;

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<FormValues>({ resolver: zodResolver(schema) });
```

- Validation messages in **Vietnamese**
- Use `FormField` from `@/components/ui/form-field` for label + error wrapper
- Use `PasswordInput` from `@/components/ui/password-input` for password fields
- Use shadcn `<Input>` and `<Button>` — customize via `className`, not raw `<input>` / `<button>`

---

## React 19 Notes

- **React Compiler is enabled** — avoid `useMemo` / `useCallback` unless profiling shows issues
- **`forwardRef` is no longer needed** — pass `ref` directly as a prop:

```typescript
// ✅ React 19
type Props = Omit<React.ComponentProps<"input">, "type">;
function PasswordInput({ className, ...props }: Props) { ... }

// ❌ Old pattern — do not use
const PasswordInput = forwardRef<HTMLInputElement, Props>((props, ref) => { ... });
```

- **Server Components by default** — add `"use client"` only when interactivity is needed

---

## Important Rules

1. **No `any` types** — use proper TypeScript
2. **No hardcoded colors** — use Tailwind tokens or `emerald-*` scale
3. **No inline styles** — use Tailwind classes
4. **Server first** — fetch in Server Components; use Client Components only for interactivity
5. **Server Actions** for all mutations (create / update / delete)
6. **Error messages in Vietnamese** for all form validation
7. **Mobile first** — design for `< md` (Bottom Nav), adapt for `md+` (Sidebar)
8. **Date/time with dayjs** — store UTC in DB, display in local timezone
9. **Keep components small** — extract logic to custom hooks
10. **Shared components go in `src/components/ui/`** — no feature folders (`auth/`, `dashboard/`)

---

## shadcn/ui Component Priority

Always prefer shadcn/ui components over raw HTML elements with Tailwind classes. Before writing a custom element, check if a shadcn component exists:

| Instead of...                   | Use shadcn...                       |
| ------------------------------- | ----------------------------------- |
| `<select>` + Tailwind classes   | `<Select>` + `<SelectTrigger>` etc. |
| `<input>` + Tailwind classes    | `<Input>`                           |
| `<button>` + Tailwind classes   | `<Button variant="...">` (in forms) |
| `<textarea>` + Tailwind classes | `<Textarea>`                        |
| Custom dropdown                 | `<DropdownMenu>` + items            |
| Custom modal                    | `<Dialog>` + `<DialogContent>` etc. |
| Custom tabs                     | `<Tabs>` + `<TabsList>` etc.        |
| Custom progress bar             | `<Progress>`                        |
| Custom badge                    | `<Badge>`                           |
| Custom scroll area              | `<ScrollArea>`                      |
| Custom table                    | `<Table>` + `<TableHeader>` etc.    |
| Info/stat card container        | `<Card>` + `<CardContent>`          |
| Status/language label           | `<Badge variant="outline">`         |

**Installing a new shadcn component:** `npx shadcn@latest add <component-name>`

Raw HTML elements with Tailwind are acceptable **only** for layout/structural elements (`div`, `section`, `nav`, `ul/li`) or when no shadcn equivalent exists (e.g., filter chips, custom cards).

---

## Don't Do

- ❌ Don't hardcode hex colors — use tokens (`bg-surface-page` not `bg-[#eff4ff]`)
- ❌ Don't use `forwardRef` — React 19 supports ref as a prop
- ❌ Don't use `var` — use `const` / `let`
- ❌ Don't use `any` type
- ❌ Don't use inline styles
- ❌ Don't put shared components in feature-specific folders (`auth/`, `dashboard/`)
- ❌ Don't use `service_role` key client-side
- ❌ Don't add `useMemo` / `useCallback` unless profiling shows a real bottleneck
- ❌ Don't create API route handlers for mutations — use Server Actions
- ❌ Don't skip TypeScript errors
- ❌ Don't use raw `<input>` / `<button>` / `<select>` in forms — use shadcn equivalents
- ❌ Don't remove `data-slot` attributes from shadcn components
- ❌ Don't write a custom component with only Tailwind if a shadcn component already covers the use case

---

## Commands

```bash
yarn dev      # Start development server
yarn build    # Production build
yarn lint     # Run ESLint
```
