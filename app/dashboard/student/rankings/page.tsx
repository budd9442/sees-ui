import { Suspense } from 'react';
import { getRankingsData } from '@/lib/actions/student-subactions';
import RankingsClient from './_components/rankings-client';
import Loading from '../loading';

export const dynamic = 'force-dynamic';

export default async function RankingsPage() {
  const data = await getRankingsData();

  return (
    <Suspense fallback={<Loading />}>
      <RankingsClient initialRankings={data} />
    </Suspense>
  );
}
