'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { updatePassword } from '@/lib/data/settings';
import {
  passwordSchema,
  type PasswordFormData,
} from '@/lib/validations/settings';

function PasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'all',
  });

  const onSubmit = (data: PasswordFormData) => {
    startTransition(async () => {
      const result = await updatePassword(data);
      if (result.error) {
        toast.error(`❌ ${result.error}`);
      } else {
        toast.success('✅ Đã đổi mật khẩu thành công!');
        reset();
        onOpenChange(false);
      }
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <FormField
            label="Mật khẩu hiện tại"
            htmlFor="currentPassword"
            error={errors.currentPassword?.message}
          >
            <PasswordInput
              id="currentPassword"
              placeholder="••••••••"
              aria-invalid={!!errors.currentPassword}
              {...register('currentPassword')}
            />
          </FormField>
          <FormField
            label="Mật khẩu mới"
            htmlFor="newPassword"
            error={errors.newPassword?.message}
          >
            <PasswordInput
              id="newPassword"
              placeholder="Ít nhất 6 ký tự"
              aria-invalid={!!errors.newPassword}
              {...register('newPassword')}
            />
          </FormField>
          <FormField
            label="Xác nhận mật khẩu mới"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || !isDirty}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isPending ? 'Đang lưu…' : 'Đổi mật khẩu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AccountSection() {
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <>
      <PasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-1 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <span className="font-black text-slate-700">Quản lý tài khoản</span>
        </div>
        <p className="mb-5 text-xs text-slate-400">
          Cập nhật mật khẩu thường xuyên để tăng cường bảo mật cho tài khoản của
          bạn.
        </p>

        {/* Change password row */}
        <button
          onClick={() => setPasswordOpen(true)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5 text-sm transition-colors hover:bg-slate-100"
        >
          <div className="flex items-center gap-3">
            <KeyRound className="h-4 w-4 text-slate-500" />
            <span className="font-medium text-slate-700">Đổi mật khẩu</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>

        {/* 2FA row — placeholder */}
        <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-[8px] font-black tracking-tight text-white">
              AUTH
            </div>
            <div>
              <p className="font-medium text-slate-700">Xác thực 2 lớp (2FA)</p>
              <p className="text-[11px] text-slate-400">Authenticator app</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-600"
            >
              Chưa kích hoạt
            </Badge>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </>
  );
}
