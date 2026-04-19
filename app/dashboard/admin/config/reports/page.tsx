import { Suspense } from 'react';
import { getAdminReportCategoriesData } from '@/lib/actions/admin-actions';
import ReportCategoriesConfig from './_components/report-categories-config';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReportCategoriesConfigPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login');
  }

  const data = await getAdminReportCategoriesData();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <ReportCategoriesConfig initialData={data} />
      </Suspense>
    </div>
  );
}
