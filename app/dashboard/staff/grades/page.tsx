import { Suspense } from 'react';
import { getStaffGradesData } from '@/lib/actions/staff-subactions';
import GradesClient from './_components/grades-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GradesPage() {
  const session = await auth();
  if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
    redirect('/login');
  }

  const data = await getStaffGradesData();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <GradesClient initialData={data} currentUserId={session.user.id} />
    </Suspense>
  );
}
