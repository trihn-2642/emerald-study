import { z } from 'zod';

import { REGEXS } from '@/constants';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email.')
    .refine((val) => REGEXS.EMAIL.test(val), {
      message: 'Email không hợp lệ.',
    }),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(1, 'Vui lòng nhập họ tên.'),
    email: z
      .string()
      .min(1, 'Vui lòng nhập email.')
      .refine((val) => REGEXS.EMAIL.test(val), {
        message: 'Email không hợp lệ.',
      }),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu.'),
    agreeToTerms: z.boolean().refine((v) => v === true, {
      message: 'Vui lòng đồng ý với điều khoản.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp.',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
