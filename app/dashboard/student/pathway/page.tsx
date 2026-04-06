import { Suspense } from 'react';
import FeatureGuard from '@/components/feature-guard';
import { FEATURE_FLAGS } from '@/lib/services/feature-flags';
import PathwayClient from './_components/pathway-client';
import { getPathwayData } from '@/lib/actions/student-subactions';
import Loading from '../loading';

export const dynamic = 'force-dynamic';

export default async function PathwaySelectionPage() {
  const data = await getPathwayData();

  return (
    <FeatureGuard featureKey={FEATURE_FLAGS.ENABLE_PATHWAY_SELECTION} userRole="STUDENT">
      <Suspense fallback={<Loading />}>
        <PathwayClient initialData={data} />
      </Suspense>
    </FeatureGuard>
  );
}
