'use client';

import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  BarChart3,
  Leaf,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const mainNavItems = [
  { href: '/dashboard', label: 'Trang chủ', icon: LayoutDashboard },
  { href: '/library', label: 'Thư viện', icon: BookOpen },
  { href: '/study', label: 'Phiên học', icon: GraduationCap },
  { href: '/stats', label: 'Thống kê', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200/50 bg-slate-50 md:flex">
      {/* Logo */}
      <div className="mb-8 px-6 pt-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-emerald-700">
            Emerald Study
          </h1>
        </div>
        <p className="mt-1.5 ml-0.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Học thuật &amp; Tối giản
        </p>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-0.5 px-3">
        {mainNavItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/stats' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-r-2 border-emerald-600 bg-emerald-50 font-semibold text-emerald-700'
                  : 'text-slate-500 hover:bg-emerald-50/70 hover:text-emerald-600',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
