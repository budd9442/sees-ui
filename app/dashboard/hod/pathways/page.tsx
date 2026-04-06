import { Suspense } from 'react';
import { getHODPathwaysData } from '@/lib/actions/hod-actions';
import PathwaysClient from './_components/pathways-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HODPathwaysPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'hod') {
    redirect('/login');
  }

  const data = await getHODPathwaysData();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <PathwaysClient initialData={data} />
    </Suspense>
  );
}
