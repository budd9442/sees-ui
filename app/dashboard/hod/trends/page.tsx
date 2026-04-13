import { Suspense } from 'react';
import { getHODTrendsData } from '@/lib/actions/hod-actions';
import HODTrendsClient from './_components/trends-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HODTrendsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'hod') {
    redirect('/login');
  }

  const data = await getHODTrendsData();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <HODTrendsClient initialData={data} />
    </Suspense>
  );
}
