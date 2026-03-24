"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "@/lib/auth-schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";

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
      setAuthError("Email hoặc mật khẩu không đúng.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <>
      {/* Branding */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">
          Chào mừng trở lại
        </h1>
        <p className="text-on-muted text-base">
          Tiếp tục hành trình chinh phục ngôn ngữ của bạn.
        </p>
      </div>

      {/* Login Card */}
      <Card className="ring-0 shadow-[0_20px_40px_rgba(11,28,48,0.05)] bg-white">
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
                className="h-auto py-3.5 px-4 bg-surface-input border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 text-on-surface placeholder:text-slate-300"
                {...register("email")}
              />
            </FormField>

            <FormField
              label="Mật khẩu"
              htmlFor="password"
              error={errors.password?.message}
              labelRight={
                <Link
                  href="#"
                  className="text-[0.6875rem] font-medium text-emerald-700 hover:text-emerald-500 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              }
            >
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-auto py-3.5 px-4 bg-surface-input border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 text-on-surface placeholder:text-slate-300"
                {...register("password")}
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
              className="w-full h-auto py-4 bg-linear-to-br from-brand-deep to-emerald-500 text-white font-semibold shadow-sm hover:opacity-90"
            >
              {isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sign up link */}
      <div className="text-center">
        <p className="text-on-muted text-sm">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-emerald-700 font-bold hover:underline ml-1"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </>
  );
}
