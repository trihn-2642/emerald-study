'use server';

import { revalidatePath } from 'next/cache';

import { ROUTES } from '@/lib/routes';
import { createClient } from '@/lib/supabase/server';
import {
  passwordSchema,
  profileSchema,
  type PasswordFormData,
  type ProfileFormData,
} from '@/lib/validations/settings';

export async function updateProfile(data: ProfileFormData) {
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: data.fullName,
      username: data.username,
      bio: data.bio ?? '',
    },
  });

  if (error) return { error: error.message };

  revalidatePath(ROUTES.SETTINGS);
  return { success: true };
}

export async function updateAvatarUrl(url: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: url },
  });
  if (error) return { error: error.message };
  revalidatePath(ROUTES.SETTINGS);
  return { success: true };
}

export async function removeAvatar() {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: null },
  });
  if (error) return { error: error.message };
  revalidatePath(ROUTES.SETTINGS);
  return { success: true };
}

export async function updatePassword(data: PasswordFormData) {
  const parsed = passwordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' };
  }

  const supabase = await createClient();

  // Verify current password by re-authenticating
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'Không tìm thấy tài khoản' };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: data.currentPassword,
  });
  if (signInError) return { error: 'Mật khẩu hiện tại không đúng' };

  const { error } = await supabase.auth.updateUser({
    password: data.newPassword,
  });
  if (error) return { error: error.message };

  return { success: true };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Không tìm thấy tài khoản' };

  // Sign out the current session.
  // Full deletion requires the Supabase Admin API with service role key,
  // which should be done via a secure server-side API route.
  await supabase.auth.signOut();
  return { success: true };
}
