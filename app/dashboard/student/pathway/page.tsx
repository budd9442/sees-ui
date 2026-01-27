import FeatureGuard from '@/components/feature-guard';
import { FEATURE_FLAGS } from '@/lib/services/feature-flags';
import PathwayClient from './_components/pathway-client';

export const dynamic = 'force-dynamic';

export default function PathwaySelectionPage() {
  return (
    <FeatureGuard featureKey={FEATURE_FLAGS.ENABLE_PATHWAY_SELECTION} userRole="STUDENT">
      <PathwayClient />
    </FeatureGuard>
  );
}
