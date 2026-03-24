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
import { loginSchema, type LoginFormValues } from '@/lib/auth-schemas';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setAuthError('Email hoặc mật khẩu không đúng.');
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  };

  return (
    <>
      {/* Branding */}
      <div className="space-y-2 text-center">
        <h1 className="text-on-surface text-3xl font-bold tracking-tight">
          Chào mừng trở lại
        </h1>
        <p className="text-on-muted text-base">
          Tiếp tục hành trình chinh phục ngôn ngữ của bạn.
        </p>
      </div>

      {/* Login Card */}
      <Card className="bg-white shadow-[0_20px_40px_rgba(11,28,48,0.05)] ring-0">
        <CardContent className="p-8 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              labelRight={
                <Link
                  href="#"
                  className="text-[0.6875rem] font-medium text-emerald-700 transition-colors hover:text-emerald-500"
                >
                  Quên mật khẩu?
                </Link>
              }
            >
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-surface-input text-on-surface h-auto border-0 px-4 py-3.5 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500"
                {...register('password')}
              />
            </FormField>

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
              {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sign up link */}
      <div className="text-center">
        <p className="text-on-muted text-sm">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="ml-1 font-bold text-emerald-700 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </>
  );
}
