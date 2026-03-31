'use client';

import { LogOut, ChevronDown, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/lib/routes';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Props = {
  name: string;
  email?: string;
  avatarUrl?: string | null;
};

export function UserMenu({ name, email, avatarUrl }: Props) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace(ROUTES.LOGIN);
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex cursor-pointer items-center gap-2.5 rounded-full p-1 transition-colors outline-none hover:bg-slate-100">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100',
              !avatarUrl && imgError && 'border-2 border-emerald-200',
            )}
          >
            {avatarUrl && !imgError ? (
              <Image
                src={avatarUrl}
                alt={name}
                width={32}
                height={32}
                className="h-full w-full object-cover"
                unoptimized
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-xs font-bold text-emerald-700">
                {initials}
              </span>
            )}
          </div>
          <span className="text-on-surface hidden max-w-30 truncate text-sm font-semibold sm:block">
            {name}
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-slate-400 sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">{name}</span>
          {email && (
            <span className="truncate text-xs font-normal text-slate-400">
              {email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={ROUTES.SETTINGS}>
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt tài khoản
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
