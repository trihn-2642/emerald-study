"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Plus, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/library", label: "Thư viện", icon: BookOpen },
  { href: "/cards/new", label: "Thêm thẻ", icon: Plus },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 min-h-screen bg-emerald-950 border-r border-emerald-900">
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-5 border-b border-emerald-900">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 shrink-0">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-sm tracking-wide">
          Emerald Study
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/cards/new" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-500 text-white"
                  : "text-emerald-100/60 hover:text-emerald-100 hover:bg-emerald-900",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
