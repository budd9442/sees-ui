import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ReportBuilderPageShell } from '@/components/analytics/report-builder-page-shell';
import { defaultHodReportDefinition } from '@/lib/analytics/default-reports';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ReportBuilderPageShell
        backHref="/dashboard/admin"
        backLabel="Admin Dashboard"
        defaultDefinition={defaultHodReportDefinition()}
        filterContext={{}}
        builderRole="admin"
        variant="fullPage"
      />
    </Suspense>
  );
}
