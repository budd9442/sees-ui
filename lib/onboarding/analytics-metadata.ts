import { prisma } from '@/lib/db';
import {
    ONBOARDING_QUESTIONS_SETTING_KEY,
    normalizeOnboardingQuestions,
    type OnboardingQuestion,
} from './question-schema';

export async function getAnalyticsEnabledOnboardingQuestions(): Promise<OnboardingQuestion[]> {
    const row = await prisma.systemSetting.findUnique({
        where: { key: ONBOARDING_QUESTIONS_SETTING_KEY },
        select: { value: true },
    });
    if (!row?.value) return [];
    try {
        const doc = normalizeOnboardingQuestions(JSON.parse(row.value));
        return doc.questions.filter((q) => q.includeInAnalytics);
    } catch {
        return [];
    }
}

export function pickAnalyticsMetadataValues(
    metadataRaw: unknown,
    allowedKeys: string[]
): Record<string, string> {
    const source = (metadataRaw && typeof metadataRaw === 'object')
        ? (metadataRaw as Record<string, unknown>)
        : {};
    const out: Record<string, string> = {};
    for (const key of allowedKeys) {
        const value = source[key];
        if (value == null) {
            out[key] = '';
            continue;
        }
        out[key] = String(value);
    }
    return out;
}
