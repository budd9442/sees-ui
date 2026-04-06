import { Suspense } from 'react';
import { getAdminGpaConfigData } from '@/lib/actions/admin-actions';
import GpaConfigClient from './_components/gpa-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminGpaConfigPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login');
  }

  const data = await getAdminGpaConfigData();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <GpaConfigClient initialData={data} />
    </Suspense>
  );
}
