import { Suspense } from 'react';
import { getAnonymousReportsData } from '@/lib/actions/admin-actions';
import ReportsReviewClient from '../../admin/reports-review/_components/reports-review-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StaffReportsReviewPage() {
  const session = await auth();
  const allowedRoles = ['staff', 'advisor', 'hod'];
  if (!session?.user?.id || !allowedRoles.includes(session.user.role || '')) {
    redirect('/login');
  }

  const data = await getAnonymousReportsData();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ReportsReviewClient initialData={data} />
    </Suspense>
  );
}
