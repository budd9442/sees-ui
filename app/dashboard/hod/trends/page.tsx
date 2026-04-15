import { Suspense } from 'react';
import { getHODTrendsData } from '@/lib/actions/hod-actions';
import HODTrendsClient from './_components/trends-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HODTrendsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'hod') {
    redirect('/login');
  }

  const sp = await searchParams;
  const pathway = typeof sp.pathway === 'string' ? sp.pathway : undefined;
  const level = typeof sp.level === 'string' ? sp.level : undefined;

  const data = await getHODTrendsData({
    pathway: pathway === 'all' ? undefined : pathway,
    level: level === 'all' ? undefined : level,
  });

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <HODTrendsClient
        initialData={data}
        initialPathway={pathway ?? 'all'}
        initialLevel={level ?? 'all'}
      />
    </Suspense>
  );
}
