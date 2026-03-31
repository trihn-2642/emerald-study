import { Leaf } from 'lucide-react';

import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';

type Props = {
  children: React.ReactNode;
  userName: string;
  userEmail?: string;
  userAvatarUrl?: string | null;
};

export function AppShell({
  children,
  userName,
  userEmail,
  userAvatarUrl,
}: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Global sticky header */}
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-100/80 bg-white/80 px-6 shadow-sm shadow-emerald-900/5 backdrop-blur-xl md:px-8">
          {/* Logo — visible on mobile only (desktop uses Sidebar) */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-emerald-700">
              Emerald Study
            </span>
          </div>
          <div className="hidden md:block" />
          <UserMenu
            name={userName}
            email={userEmail}
            avatarUrl={userAvatarUrl}
          />
        </header>
        <main className="bg-surface-page flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
