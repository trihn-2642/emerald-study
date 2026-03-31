'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  updateAvatarUrl,
  updateProfile,
  removeAvatar,
} from '@/lib/data/settings';
import { createClient } from '@/lib/supabase/client';
import {
  profileSchema,
  type ProfileFormData,
} from '@/lib/validations/settings';

type Props = {
  profile: {
    fullName: string;
    username: string;
    email: string;
    bio: string;
    avatarUrl: string | null;
    emailVerified: boolean;
  };
};

export function ProfileSection({ profile }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string | null>(
    profile.avatarUrl,
  );
  const [imgError, setImgError] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingRemove, setPendingRemove] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = profile.fullName
    ? profile.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : profile.email.slice(0, 2).toUpperCase();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      username: profile.username,
      bio: profile.bio,
    },
    mode: 'all',
  });

  const canSubmit = isFormDirty || !!pendingFile || pendingRemove;

  const onSubmit = (data: ProfileFormData) => {
    startTransition(async () => {
      // Upload pending avatar file first (if any)
      if (pendingRemove) {
        // Delete all files in user's folder
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: existingFiles } = await supabase.storage
            .from('avatars')
            .list(user.id);
          if (existingFiles && existingFiles.length > 0) {
            const toDelete = existingFiles.map((f) => `${user.id}/${f.name}`);
            await supabase.storage.from('avatars').remove(toDelete);
          }
        }
        const result = await removeAvatar();
        if (result.error) {
          toast.error(`❌ ${result.error}`);
          return;
        }
        setDisplayUrl(null);
        setPendingRemove(false);
      } else if (pendingFile) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast.error('❌ Không tìm thấy tài khoản.');
          return;
        }

        const newPath = `${user.id}/${pendingFile.name}`;

        // Delete all existing avatar files for this user before uploading
        const { data: existingFiles } = await supabase.storage
          .from('avatars')
          .list(user.id);
        if (existingFiles && existingFiles.length > 0) {
          const toDelete = existingFiles.map((f) => `${user.id}/${f.name}`);
          await supabase.storage.from('avatars').remove(toDelete);
        }

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(newPath, pendingFile, { upsert: true });

        if (uploadError) {
          toast.error(
            '❌ Không thể tải ảnh lên. Kiểm tra cài đặt Storage bucket trong Supabase.',
          );
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(newPath);

        const avatarResult = await updateAvatarUrl(publicUrl);
        if (avatarResult.error) {
          toast.error(`❌ ${avatarResult.error}`);
          return;
        }

        setDisplayUrl(publicUrl);
        setPendingFile(null);
      } // end if pendingFile

      const result = await updateProfile(data);
      if (result.error) {
        toast.error(`❌ ${result.error}`);
      } else {
        toast.success('✅ Đã cập nhật thông tin!');
        setIsFormDirty(false);
      }
    });
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Chỉ chấp nhận file JPG, JPEG, PNG hoặc WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 2MB.');
      return;
    }

    // Show local preview only — upload happens on form submit
    const previewUrl = URL.createObjectURL(file);
    setDisplayUrl(previewUrl);
    setImgError(false);
    setPendingFile(file);
    setPendingRemove(false);

    // Reset input so re-selecting same file triggers onChange again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      {/* Section title */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-lg font-black text-slate-700">
          Thông tin cá nhân
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar + fields top row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="relative">
              <div className="h-20 w-20 overflow-hidden rounded-2xl bg-emerald-100">
                {displayUrl && !imgError ? (
                  <Image
                    src={displayUrl}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-black text-emerald-600">
                    {initials}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isPending}
                className="absolute -right-1.5 -bottom-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              {(displayUrl && !imgError) || pendingFile ? (
                <button
                  type="button"
                  onClick={() => {
                    setDisplayUrl(null);
                    setImgError(false);
                    setPendingFile(null);
                    setPendingRemove(true);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isPending}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600 disabled:opacity-60"
                  title="Xoá ảnh đại diện"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-center text-[11px] text-slate-400 sm:text-left">
              JPG, JPEG, PNG hoặc WebP.
              <br />
              Tối đa 2MB.
            </p>
          </div>

          {/* Name + Username */}
          <div className="flex-1 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Họ và tên"
                htmlFor="fullName"
                error={errors.fullName?.message}
              >
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  aria-invalid={!!errors.fullName}
                  {...register('fullName', {
                    onChange: () => setIsFormDirty(true),
                  })}
                />
              </FormField>
              <FormField
                label="Tên đăng nhập"
                htmlFor="username"
                error={errors.username?.message}
              >
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                    @
                  </span>
                  <Input
                    id="username"
                    className="pl-7"
                    placeholder="ten_dang_nhap"
                    aria-invalid={!!errors.username}
                    {...register('username', {
                      onChange: () => setIsFormDirty(true),
                    })}
                  />
                </div>
              </FormField>
            </div>

            {/* Email — read-only */}
            <FormField label="Email" htmlFor="email">
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className="cursor-default pr-28 text-slate-500"
                />
                {profile.emailVerified && (
                  <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã xác thực
                  </span>
                )}
              </div>
            </FormField>
          </div>
        </div>

        {/* Bio */}
        <FormField label="Tiểu sử" htmlFor="bio" error={errors.bio?.message}>
          <Textarea
            id="bio"
            rows={3}
            placeholder="Yêu thích ngoại ngữ và muốn xem phim, nghe nhạc không cần vietsub..."
            aria-invalid={!!errors.bio}
            {...register('bio', { onChange: () => setIsFormDirty(true) })}
          />
        </FormField>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending || !canSubmit}
            className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
          >
            {isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
