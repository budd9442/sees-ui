import { Suspense } from 'react';
import { getAdminAnonymousReportsData } from '@/lib/actions/admin-actions';
import ReportsReviewClient from './_components/reports-review-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminReportsReviewPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login');
  }

  const data = await getAdminAnonymousReportsData();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ReportsReviewClient initialData={data} />
    </Suspense>
  );
}
