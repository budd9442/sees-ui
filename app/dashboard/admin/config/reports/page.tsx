import { Suspense } from 'react';
import { getAdminReportTemplatesData } from '@/lib/actions/admin-actions';
import ReportsConfigClient from './_components/reports-config-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminReportsConfigPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login');
  }

  const data = await getAdminReportTemplatesData();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ReportsConfigClient initialData={data} />
    </Suspense>
  );
}