import { checkFeatureFlag } from '@/app/actions/feature-flags';

export const FEATURE_FLAGS = {
    ENABLE_PATHWAY_SELECTION: 'pathway_selection',
    ENABLE_MODULE_REGISTRATION: 'module_registration',
    ENABLE_SPECIALIZATION_SELECTION: 'specialization_selection',
    ENABLE_ANONYMOUS_REPORTS: 'anonymous_reports',
};

// Deprecated: Defaults are now managed in DB. Kept for reference.
export const DEFAULT_FLAGS = {
    [FEATURE_FLAGS.ENABLE_PATHWAY_SELECTION]: true,
    [FEATURE_FLAGS.ENABLE_MODULE_REGISTRATION]: true,
    [FEATURE_FLAGS.ENABLE_SPECIALIZATION_SELECTION]: false,
    [FEATURE_FLAGS.ENABLE_ANONYMOUS_REPORTS]: true,
};

export async function getFeatureFlag(key: string): Promise<boolean> {
    const isEnabled = await checkFeatureFlag(key);
    return isEnabled;
}

// Helper to get all flags status for client usage if needed
export async function getAllFeatureFlags(): Promise<Record<string, boolean>> {
    const flags: Record<string, boolean> = {};
    for (const key of Object.values(FEATURE_FLAGS)) {
        flags[key] = await checkFeatureFlag(key);
    }
    return flags;
}

export async function setFeatureFlag(key: string, value: boolean): Promise<void> {
    // This is a simplified wrapper. For full management use app/actions/feature-flags.ts
    // We won't implement write here to avoid circular deps or complex logic duplication.
    console.warn('setFeatureFlag in lib/services is deprecated. Use server actions.');
}
