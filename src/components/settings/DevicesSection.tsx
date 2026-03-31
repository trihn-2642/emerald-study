'use client';

import { ChevronRight, Link2, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ROUTES } from '@/lib/routes';
import { createClient } from '@/lib/supabase/client';

function getDeviceName(): string {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent;
  const browser = ua.includes('Chrome')
    ? 'Chrome'
    : ua.includes('Firefox')
      ? 'Firefox'
      : ua.includes('Safari')
        ? 'Safari'
        : 'Trình duyệt';
  const os = ua.includes('Mac')
    ? 'macOS'
    : ua.includes('Win')
      ? 'Windows'
      : ua.includes('Linux')
        ? 'Linux'
        : ua.includes('Android')
          ? 'Android'
          : ua.includes('iPhone') || ua.includes('iPad')
            ? 'iOS'
            : 'Unknown OS';
  return `${os} · ${browser}`;
}

export function DevicesSection() {
  // Initialize empty so server + client first render match, then hydrate on client
  const [deviceName, setDeviceName] = useState('');

  const handleSignOutAll = async () => {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: 'global' });
    toast.success('Đã đăng xuất khỏi tất cả thiết bị.');
    window.location.href = ROUTES.LOGIN;
  };

  useEffect(() => {
    setDeviceName(getDeviceName()); // eslint-disable-line
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-1 flex items-center gap-2">
        <Monitor className="h-5 w-5 text-emerald-600" />
        <span className="font-black text-slate-700">
          Thiết bị &amp; Liên kết
        </span>
      </div>
      <p className="mb-5 text-xs text-slate-400">
        Xem các thiết bị đang đăng nhập và quản lý các dịch vụ bên thứ ba.
      </p>

      {/* Current session */}
      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5 text-sm">
        <div className="flex items-center gap-3">
          <Monitor className="h-4 w-4 text-slate-500" />
          <div>
            <p className="font-medium text-slate-700">
              {deviceName || 'Thiết bị hiện tại'}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-[11px] text-emerald-600">Đang hoạt động</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOutAll}
          className="cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        >
          Đăng xuất
        </button>
      </div>

      {/* Social links placeholder */}
      <div className="mt-2 flex cursor-not-allowed items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5 text-sm opacity-60">
        <div className="flex items-center gap-3">
          <Link2 className="h-4 w-4 text-slate-500" />
          <span className="font-medium text-slate-700">
            Liên kết mạng xã hội
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}
