import { Suspense } from 'react';
import { FEATURE_FLAGS } from '@/lib/services/feature-flags';
import FeatureGuard from '@/components/feature-guard';
import SpecializationClient from './_components/specialization-client';

export const dynamic = 'force-dynamic';

export default async function SpecializationPage() {
  return (
    <FeatureGuard featureKey={FEATURE_FLAGS.ENABLE_SPECIALIZATION_SELECTION} userRole="STUDENT">
      <Suspense fallback={<div>Loading...</div>}>
        <SpecializationClient />
      </Suspense>
    </FeatureGuard>
  );
}