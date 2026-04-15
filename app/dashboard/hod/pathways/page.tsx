import { Suspense } from 'react';
import { getHODSelectionData } from '@/lib/actions/selection-actions';
import SelectionClient from './_components/pathways-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HODPathwaysPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'hod' && session.user.role !== 'admin')) {
    redirect('/login');
  }

  const result = await getHODSelectionData();
  const data = result.data ?? { academicYears: [], allRounds: [], approvedRounds: [], programs: [], specializations: [] };

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <SelectionClient initialData={data} />
    </Suspense>
  );
}
