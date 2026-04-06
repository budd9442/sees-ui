import { Suspense } from 'react';
import { getHODAnalyticsData } from '@/lib/actions/hod-actions';
import HODAnalyticsClient from './_components/analytics-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HODAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'hod') {
    redirect('/login');
  }

  const data = await getHODAnalyticsData();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <HODAnalyticsClient initialData={data} />
    </Suspense>
  );
}
