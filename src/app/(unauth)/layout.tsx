import { Leaf } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-page text-on-surface flex min-h-screen flex-col antialiased">
      {/* Fixed Header */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-center bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-emerald-700">
            Emerald Study
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex grow items-center justify-center px-6 pt-19 pb-6">
        <div className="flex w-full max-w-110 flex-col gap-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="mt-auto w-full border-t border-slate-100 bg-slate-50 py-6">
        <div className="mx-auto flex flex-col items-center justify-between gap-4 px-8 md:flex-row">
          <p className="text-[11px] font-medium tracking-widest text-slate-400 uppercase">
            © 2026 Emerald Study. Trải nghiệm học tập tinh hoa.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-[11px] font-medium tracking-widest text-slate-400 uppercase transition-all hover:text-emerald-600"
            >
              Điều khoản
            </Link>
            <Link
              href="#"
              className="text-[11px] font-medium tracking-widest text-slate-400 uppercase transition-all hover:text-emerald-600"
            >
              Bảo mật
            </Link>
            <Link
              href="#"
              className="text-[11px] font-medium tracking-widest text-slate-400 uppercase transition-all hover:text-emerald-600"
            >
              Trợ giúp
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
