import { Suspense } from 'react';
import { getStaffModuleRoster } from '@/lib/actions/staff-subactions';
import RosterPageClient from './RosterPageClient';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface RosterPageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

export default async function RosterPage({ params }: RosterPageProps) {
  const session = await auth();
  if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
    redirect('/login');
  }

  const { moduleId } = await params;
  const rosterData = await getStaffModuleRoster(moduleId);

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <RosterPageClient initialRoster={rosterData} />
    </Suspense>
  );
}