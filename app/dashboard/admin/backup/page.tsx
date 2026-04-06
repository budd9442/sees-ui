import { Suspense } from 'react';
import { getAdminBackupsData } from '@/lib/actions/admin-actions';
import BackupClient from './_components/backup-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBackupPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login');
  }

  const data = await getAdminBackupsData();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <BackupClient initialData={data} />
    </Suspense>
  );
}
