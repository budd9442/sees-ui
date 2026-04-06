import { Suspense } from 'react';
import { getStaffAnalytics } from '@/lib/actions/staff-subactions';
import AnalyticsClient from './_components/analytics-client';
import { Loader2 } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
    redirect('/login');
  }

  const modules = await getStaffAnalytics();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AnalyticsClient initialModules={modules} />
    </Suspense>
  );
}
