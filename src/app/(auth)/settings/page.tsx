import { Settings } from 'lucide-react';

import { AccountSection } from '@/components/settings/AccountSection';
import { DangerZone } from '@/components/settings/DangerZone';
import { DevicesSection } from '@/components/settings/DevicesSection';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { getUser } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const user = await getUser();

  const profile = {
    fullName: (user.user_metadata?.full_name as string) ?? '',
    username: (user.user_metadata?.username as string) ?? '',
    email: user.email ?? '',
    bio: (user.user_metadata?.bio as string) ?? '',
    avatarUrl: (user.user_metadata?.avatar_url as string) ?? null,
    emailVerified: !!user.email_confirmed_at,
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-emerald-600" />
          <h1 className="text-on-surface text-3xl font-black tracking-tight">
            Cài đặt tài khoản
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Quản lý thông tin cá nhân, bảo mật và các tuỳ chọn trải nghiệm học tập
          của bạn tại Emerald Study.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        <ProfileSection profile={profile} />

        <div className="grid gap-6 md:grid-cols-2">
          <AccountSection />
          <DevicesSection />
        </div>

        <DangerZone />
      </div>
    </div>
  );
}
