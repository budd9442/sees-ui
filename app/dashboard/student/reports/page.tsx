import { Suspense } from 'react';
import { FEATURE_FLAGS } from '@/lib/constants/feature-flags';
import FeatureGuard from '@/components/feature-guard';
import ReportsClient from './_components/reports-client';

export const dynamic = 'force-dynamic';

export default async function AnonymousReportsPage() {
  return (
    <FeatureGuard featureKey={FEATURE_FLAGS.ENABLE_ANONYMOUS_REPORTS} userRole="STUDENT">
      <Suspense fallback={<div>Loading...</div>}>
        <ReportsClient />
      </Suspense>
    </FeatureGuard>
  );
}
