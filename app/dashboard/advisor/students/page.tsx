import { Suspense } from 'react';
import { getAdviseesData } from '@/lib/actions/advisor-subactions';
import AdvisorStudentsClient from './_components/students-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdvisorStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
    redirect('/login');
  }

  const data = await getAdviseesData();
  const { tab } = await searchParams;

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AdvisorStudentsClient initialData={data} initialTab={tab} />
    </Suspense>
  );
}
