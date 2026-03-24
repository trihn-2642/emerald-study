import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';

type Props = {
  children: React.ReactNode;
  userName: string;
  userEmail?: string;
};

export function AppShell({ children, userName, userEmail }: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Global sticky header */}
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-100/80 bg-white/80 px-6 shadow-sm shadow-emerald-900/5 backdrop-blur-xl md:px-8">
          <div />
          <UserMenu name={userName} email={userEmail} />
        </header>
        <main className="bg-surface-page flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
