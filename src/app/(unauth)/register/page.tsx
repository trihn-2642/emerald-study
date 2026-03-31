'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { createClient } from '@/lib/supabase/client';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/lib/validations/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setAuthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } },
    });

    if (error) {
      setAuthError(error.message ?? 'Đăng ký thất bại. Vui lòng thử lại.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <>
      {/* Branding */}
      <div className="space-y-3 text-center">
        <h1 className="text-on-surface text-4xl font-extrabold tracking-tight">
          Bắt đầu hành trình.
        </h1>
        <p className="font-medium text-slate-500">
          Trải nghiệm học tập tinh hoa cùng Emerald Study.
        </p>
      </div>

      {/* Registration Card */}
      <Card className="bg-white shadow-[0_20px_40px_rgba(11,28,48,0.05)] ring-0">
        <CardContent className="space-y-8 p-8 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              label="Họ và tên"
              htmlFor="fullName"
              error={errors.fullName?.message}
            >
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                className="bg-surface-input text-on-surface h-auto border-0 px-4 py-3.5 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500"
                {...register('fullName')}
              />
            </FormField>

            <FormField
              label="Email"
              htmlFor="email"
              error={errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                className="bg-surface-input text-on-surface h-auto border-0 px-4 py-3.5 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500"
                {...register('email')}
              />
            </FormField>

            <FormField
              label="Mật khẩu"
              htmlFor="password"
              error={errors.password?.message}
            >
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="bg-surface-input text-on-surface h-auto border-0 px-4 py-3.5 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500"
                {...register('password')}
              />
            </FormField>

            <FormField
              label="Xác nhận mật khẩu"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                autoComplete="new-password"
                className="bg-surface-input text-on-surface h-auto border-0 px-4 py-3.5 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500"
                {...register('confirmPassword')}
              />
            </FormField>

            {/* Terms */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 items-center">
                  <input
                    id="agreeToTerms"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 accent-emerald-600"
                    {...register('agreeToTerms')}
                  />
                </div>
                <label
                  htmlFor="agreeToTerms"
                  className="cursor-pointer text-[13px] leading-tight text-slate-500"
                >
                  Tôi đồng ý với các{' '}
                  <Link
                    href="#"
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    Điều khoản dịch vụ
                  </Link>{' '}
                  và{' '}
                  <Link
                    href="#"
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    Chính sách bảo mật
                  </Link>
                  .
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="ml-1 text-xs text-red-500">
                  {errors.agreeToTerms.message}
                </p>
              )}
            </div>

            {authError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {authError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="from-brand-deep h-auto w-full bg-linear-to-br to-emerald-500 py-4 font-semibold text-white shadow-sm hover:opacity-90"
            >
              {isSubmitting ? 'Đang tạo tài khoản…' : 'Đăng ký tài khoản'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Login link */}
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="ml-1 font-bold text-emerald-700 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </>
  );
}
