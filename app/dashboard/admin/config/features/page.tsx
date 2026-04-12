import { getFeatureFlags } from '@/app/actions/feature-flags';
import FeatureGovernanceClient from './_components/feature-governance-client';

export default async function FeatureGovernancePage() {
    const response = await getFeatureFlags();
    const flags = response.success ? response.data : [];

    return (
        <FeatureGovernanceClient initialFlags={flags as any} />
    );
}
