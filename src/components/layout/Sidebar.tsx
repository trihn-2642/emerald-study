'use client';

import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  BarChart3,
  Leaf,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';

const mainNavItems = [
  { href: ROUTES.DASHBOARD, label: 'Trang chủ', icon: LayoutDashboard },
  { href: ROUTES.LIBRARY, label: 'Thư viện', icon: BookOpen },
  { href: ROUTES.STUDY, label: 'Phiên học', icon: GraduationCap },
  { href: ROUTES.STATS, label: 'Thống kê', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto border-r border-slate-200/50 bg-slate-50 transition-all duration-200 md:flex',
        isSidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Collapse toggle — fixed to the right border of sidebar */}
      <button
        onClick={toggleSidebarCollapsed}
        title={isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        className="fixed top-18 z-50 flex h-6 w-6 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:text-emerald-600"
        style={{
          left: isSidebarCollapsed ? '4rem' : '16rem',
        }}
      >
        <ChevronLeft
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            isSidebarCollapsed && 'rotate-180',
          )}
        />
      </button>

      {/* Logo area */}
      <div
        className={cn(
          'flex items-center pt-7',
          isSidebarCollapsed ? 'justify-center px-2 pb-4' : 'mb-8 px-6',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
          <Leaf className="h-4 w-4 text-white" />
        </div>
        {!isSidebarCollapsed && (
          <div className="ml-2">
            <h1 className="text-lg leading-tight font-bold tracking-tight text-emerald-700">
              Emerald Study
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Học thuật &amp; Tối giản
            </p>
          </div>
        )}
      </div>

      {/* Main navigation */}
      <nav
        className={cn(
          'flex-1 space-y-0.5',
          isSidebarCollapsed ? 'px-2' : 'px-3',
        )}
      >
        {mainNavItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/stats' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              title={isSidebarCollapsed ? label : undefined}
              className={cn(
                'flex items-center rounded-sm py-3 text-sm font-medium transition-colors',
                isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4',
                isActive
                  ? 'border-r-2 border-emerald-600 bg-emerald-50 font-semibold text-emerald-700'
                  : 'text-slate-500 hover:bg-emerald-50/70 hover:text-emerald-600',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
