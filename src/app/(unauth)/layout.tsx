import { Leaf } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-page text-on-surface antialiased">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm h-16 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-emerald-700">
            Emerald Study
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="grow flex items-center justify-center px-6 pt-19 pb-6">
        <div className="w-full max-w-110 flex flex-col gap-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-slate-50 mt-auto border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between px-8  mx-auto gap-4">
          <p className="text-[11px] uppercase tracking-widest font-medium text-slate-400">
            © 2026 Emerald Study. Trải nghiệm học tập tinh hoa.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-[11px] uppercase tracking-widest font-medium text-slate-400 hover:text-emerald-600 transition-all"
            >
              Điều khoản
            </Link>
            <Link
              href="#"
              className="text-[11px] uppercase tracking-widest font-medium text-slate-400 hover:text-emerald-600 transition-all"
            >
              Bảo mật
            </Link>
            <Link
              href="#"
              className="text-[11px] uppercase tracking-widest font-medium text-slate-400 hover:text-emerald-600 transition-all"
            >
              Trợ giúp
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
