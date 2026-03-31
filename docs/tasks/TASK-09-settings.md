# Task 09: Settings – Cài đặt tài khoản

## 🎯 Mục tiêu

Xây dựng màn hình cài đặt tài khoản cho phép người dùng:

- Cập nhật thông tin cá nhân: họ tên, tên đăng nhập, tiểu sử và ảnh đại diện.
- Đổi mật khẩu (có xác minh mật khẩu hiện tại).
- Xem trạng thái xác thực 2 lớp (2FA) — placeholder.
- Xem thiết bị đang đăng nhập và liên kết mạng xã hội — placeholder.
- Xóa tài khoản (vùng nguy hiểm).

Tất cả dữ liệu người dùng được lưu trong `user_metadata` của Supabase Auth. Ảnh đại diện được upload lên Supabase Storage bucket `avatars` (cần tạo thủ công trong dashboard).

---

## 📁 Các file cần tạo / sửa

### Tạo mới

| File                                         | Mô tả                                                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/app/(auth)/settings/page.tsx`           | Server Component — fetch user data, render layout toàn trang                                          |
| `src/components/settings/ProfileSection.tsx` | Form thông tin cá nhân: avatar, họ tên, username, email, tiểu sử                                      |
| `src/components/settings/AccountSection.tsx` | Card quản lý tài khoản: đổi mật khẩu dialog, 2FA placeholder                                          |
| `src/components/settings/DevicesSection.tsx` | Card thiết bị & liên kết: session hiện tại, social links placeholder                                  |
| `src/components/settings/DangerZone.tsx`     | Vùng nguy hiểm: xác nhận xóa tài khoản                                                                |
| `src/lib/validations/settings.ts`            | Zod schemas: `profileSchema`, `passwordSchema`                                                        |
| `src/lib/data/settings.ts`                   | Server Actions: `updateProfile`, `updatePassword`, `updateAvatarUrl`, `removeAvatar`, `deleteAccount` |
| `src/components/ui/textarea.tsx`             | shadcn Textarea component                                                                             |

### Sửa

| File                                 | Thay đổi                                                        |
| ------------------------------------ | --------------------------------------------------------------- |
| `src/lib/routes.ts`                  | Thêm `SETTINGS: '/settings'`                                    |
| `src/components/layout/UserMenu.tsx` | Thêm item "Cài đặt tài khoản" với icon Settings trước Đăng xuất |
| `src/components/layout/Sidebar.tsx`  | Thêm link "Cài đặt" ở cuối sidebar (bottom utility item)        |

---

## 🏗️ Chi tiết kỹ thuật

### Supabase Free Tier — Avatar Upload

Supabase Free tier hỗ trợ Storage (500MB). Để upload avatar hoạt động:

1. Vào **Supabase Dashboard → Storage → New bucket**
2. Đặt tên bucket: `avatars`, bật **Public bucket**
3. Thêm RLS policy cho Storage:

   ```sql
   -- Allow authenticated users to upload their own avatar
   CREATE POLICY "Users can upload own avatar" ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

   -- Allow public read
   CREATE POLICY "Avatar is publicly readable" ON storage.objects
   FOR SELECT TO public
   USING (bucket_id = 'avatars');
   ```

Nếu chưa setup bucket, uploader sẽ hiển thị toast lỗi nhưng app vẫn hoạt động bình thường.

---

### `src/lib/validations/settings.ts`

```ts
export const profileSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  username: z
    .string()
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(30, 'Tối đa 30 ký tự')
    .regex(/^[a-z0-9_]+$/, 'Chỉ dùng chữ thường, số và dấu _'),
  bio: z.string().max(200, 'Tiểu sử tối đa 200 ký tự').optional(),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Nhập mật khẩu hiện tại'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
```

---

### `src/lib/data/settings.ts` — Server Actions

```ts
'use server';

// updateProfile: cập nhật user_metadata (full_name, username, bio)
// updatePassword: xác minh mật khẩu cũ bằng signInWithPassword, sau đó updateUser
// updateAvatarUrl: sau khi upload client-side, cập nhật avatar_url vào user_metadata
// deleteAccount: sign out (xóa thật cần admin API — ghi note)
```

---

### Avatar Upload Flow (client-side)

```
1. User chọn file → file input onChange
2. Validate: jpg/png/webp, max 2MB
3. Upload trực tiếp từ browser lên Supabase Storage:
   supabase.storage.from('avatars').upload(`{userId}/avatar.{ext}`, file, { upsert: true })
4. Lấy public URL → gọi server action `updateAvatarUrl(url)`
5. `revalidatePath('/settings')` để cập nhật layout header
```

---

### Lưu ý về Delete Account

Xóa tài khoản bằng `supabase.auth.admin.deleteUser()` yêu cầu **Service Role Key** (không được dùng client-side). Phương án thay thế trong bản hiện tại:

- Sign out ngay lập tức.
- Ghi note trong code rằng cần thêm API route dùng service role key để xóa hoàn toàn.

---

## 🗂️ Luồng điều hướng

```
UserMenu dropdown → "Cài đặt tài khoản" → /settings
Sidebar (bottom) → "Cài đặt" → /settings
```

Route `/settings` thuộc route group `(auth)` — được bảo vệ bởi `AppShell` + `getUser()`.

---

## ✅ Checklist

- [x] Textarea UI component
- [x] Zod validation schemas
- [x] Server actions: updateProfile, updatePassword, updateAvatarUrl, removeAvatar, deleteAccount
- [x] ProfileSection với react-hook-form + avatar upload + preview + xoá avatar
- [x] AccountSection với Dialog đổi mật khẩu
- [x] DevicesSection (current session + placeholder)
- [x] DangerZone với confirmation dialog
- [x] Settings page Server Component
- [x] ROUTES.SETTINGS
- [x] UserMenu item + hiển thị avatar
- [x] Sidebar bottom link
