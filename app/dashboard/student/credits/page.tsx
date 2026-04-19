import { Suspense } from 'react';
import { getCreditsData } from '@/lib/actions/student-subactions';
import { CreditsClient } from './credits-client';
import Loading from '../loading';

export const dynamic = 'force-dynamic';

export default async function CreditsPage() {
  const data = await getCreditsData();

  return (
    <Suspense fallback={<Loading />}>
      <CreditsClient {...data} />
    </Suspense>
  );
}
