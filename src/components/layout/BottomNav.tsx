'use client';

import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Trang chủ', icon: LayoutDashboard },
  { href: '/library', label: 'Thư viện', icon: BookOpen },
  { href: '/study', label: 'Học', icon: GraduationCap },
  { href: '/stats', label: 'Số liệu', icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 flex rounded-t-3xl border-t border-slate-100 bg-white/90 shadow-[0_-10px_30px_rgba(16,185,129,0.05)] backdrop-blur-lg md:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== '/study' &&
            href !== '/stats' &&
            pathname.startsWith(href + '/'));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 pt-3 pb-4 text-[10px] font-bold tracking-widest uppercase transition-colors',
              isActive
                ? 'rounded-xl bg-emerald-50/70 text-emerald-700'
                : 'text-slate-400 hover:text-emerald-600',
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5',
                isActive && 'fill-emerald-100 stroke-emerald-700',
              )}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
