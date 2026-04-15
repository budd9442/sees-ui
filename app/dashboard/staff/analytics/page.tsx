import { Suspense } from 'react';
import { getStaffAnalytics, getStaffAnalyticsFilterOptions } from '@/lib/actions/staff-subactions';
import AnalyticsClient from './_components/analytics-client';
import { Loader2 } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
    redirect('/login');
  }

  const sp = await searchParams;
  const academicYearId = typeof sp.year === 'string' ? sp.year : undefined;
  const semesterId = typeof sp.semester === 'string' ? sp.semester : undefined;

  const [modules, filterYears] = await Promise.all([
    getStaffAnalytics({
      academicYearId: academicYearId === 'all' ? undefined : academicYearId,
      semesterId: semesterId === 'all' ? undefined : semesterId,
    }),
    getStaffAnalyticsFilterOptions(),
  ]);

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AnalyticsClient
        initialModules={modules}
        filterYears={filterYears}
        initialAcademicYearId={academicYearId ?? 'all'}
        initialSemesterId={semesterId ?? 'all'}
      />
    </Suspense>
  );
}
