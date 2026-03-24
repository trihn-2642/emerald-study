"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterFormValues } from "@/lib/auth-schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";

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
      setAuthError(error.message ?? "Đăng ký thất bại. Vui lòng thử lại.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <>
      {/* Branding */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Bắt đầu hành trình.
        </h1>
        <p className="text-slate-500 font-medium">
          Trải nghiệm học tập tinh hoa cùng Emerald Study.
        </p>
      </div>

      {/* Registration Card */}
      <Card className="ring-0 shadow-[0_20px_40px_rgba(11,28,48,0.05)] bg-white">
        <CardContent className="p-8 md:p-10 space-y-8">
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
                className="h-auto py-3.5 px-4 bg-surface-input border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 text-on-surface placeholder:text-slate-300"
                {...register("fullName")}
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
                className="h-auto py-3.5 px-4 bg-surface-input border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 text-on-surface placeholder:text-slate-300"
                {...register("email")}
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
                className="h-auto py-3.5 px-4 bg-surface-input border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 text-on-surface placeholder:text-slate-300"
                {...register("password")}
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
                className="h-auto py-3.5 px-4 bg-surface-input border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 text-on-surface placeholder:text-slate-300"
                {...register("confirmPassword")}
              />
            </FormField>

            {/* Terms */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 accent-emerald-600"
                    {...register("agreeToTerms")}
                  />
                </div>
                <label
                  htmlFor="agreeToTerms"
                  className="text-[13px] text-slate-500 leading-tight cursor-pointer"
                >
                  Tôi đồng ý với các{" "}
                  <Link
                    href="#"
                    className="text-emerald-700 font-medium hover:underline"
                  >
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link
                    href="#"
                    className="text-emerald-700 font-medium hover:underline"
                  >
                    Chính sách bảo mật
                  </Link>
                  .
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-xs text-red-500 ml-1">
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
              className="w-full h-auto py-4 bg-linear-to-br from-brand-deep to-emerald-500 text-white font-semibold shadow-sm hover:opacity-90"
            >
              {isSubmitting ? "Đang tạo tài khoản…" : "Đăng ký tài khoản"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Login link */}
      <div className="text-center">
        <p className="text-slate-500 font-medium text-sm">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="text-emerald-700 font-bold hover:underline ml-1"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </>
  );
}
