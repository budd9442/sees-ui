import { Suspense } from 'react';
import { QuantitativeGoalsClient } from './quantitative-goals-client';
import { getGoals } from '@/lib/actions/student-subactions';
import Loading from '../loading';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <Suspense fallback={<Loading />}>
      <QuantitativeGoalsClient initialGoals={goals} />
    </Suspense>
  );
}