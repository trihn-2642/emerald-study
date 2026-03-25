import { AppShell } from '@/components/layout/AppShell';
import { getUser } from '@/lib/supabase/server';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const userName = user.user_metadata?.full_name ?? user.email?.split('@')[0];

  return (
    <AppShell userName={userName} userEmail={user.email}>
      {children}
    </AppShell>
  );
}
