import { Suspense } from 'react';
import { getAdminNotificationsData } from '@/lib/actions/admin-actions';
import NotificationsClient from './_components/notifications-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login');
  }

  const data = await getAdminNotificationsData();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <NotificationsClient initialData={data} />
    </Suspense>
  );
}
