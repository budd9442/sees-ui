import { Suspense } from 'react';
import { FEATURE_FLAGS } from '@/lib/services/feature-flags';
import FeatureGuard from '@/components/feature-guard';
import SpecializationClient from './_components/specialization-client';
import { getSpecializationData } from '@/lib/actions/student-subactions';

export const dynamic = 'force-dynamic';

export default async function SpecializationPage() {
  const data = await getSpecializationData();

  return (
    <FeatureGuard featureKey={FEATURE_FLAGS.ENABLE_SPECIALIZATION_SELECTION} userRole="STUDENT">
      <Suspense fallback={<div>Loading...</div>}>
        <SpecializationClient initialData={data} />
      </Suspense>
    </FeatureGuard>
  );
}