'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { GeminiService } from '@/lib/services/gemini-service';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const specializationPreferenceSchema = z.object({
    academicInterests: z.array(z.string().trim()).min(2),
    careerAspirations: z.array(z.string().trim()).min(2),
    preferredSpecialization: z.enum(['BSE', 'OSCM', 'IS']).optional().nullable(),
    alternativeSpecialization: z.enum(['BSE', 'OSCM', 'IS']).optional().nullable(),
    reasoning: z.string().trim().min(50),
    technicalInterests: z.array(z.string().trim()).optional(),
    careerFocus: z.array(z.string().trim()).optional(),
    projectTypes: z.array(z.string().trim()).optional(),
    learningGoals: z.array(z.string().trim()).optional(),
    skillDevelopment: z.array(z.string().trim()).optional(),
    workEnvironment: z.string().trim().optional(),
    additionalNotes: z.string().trim().optional(),
});

type SpecializationCode = 'BSE' | 'OSCM' | 'IS';

type GuidanceConfig = {
    minimumGpa: number;
    weights: {
        preferences: number;
        transcriptFit: number;
        careerFit: number;
        gpaReadiness: number;
    };
    profileKeywords: Record<SpecializationCode, string[]>;
};

const DEFAULT_GUIDANCE_CONFIG: GuidanceConfig = {
    minimumGpa: 2.0,
    weights: {
        preferences: 35,
        transcriptFit: 35,
        careerFit: 20,
        gpaReadiness: 10,
    },
    profileKeywords: {
        BSE: ['business', 'management', 'process', 'systems', 'analysis', 'erp', 'project'],
        OSCM: ['operations', 'supply', 'logistics', 'optimization', 'quality', 'analytics'],
        IS: ['database', 'network', 'infrastructure', 'information', 'security', 'architecture', 'data'],
    },
};

function clampScore(n: number) {
    return Math.max(0, Math.min(100, Number(n.toFixed(2))));
}

function normalizeList(input?: string[] | null) {
    return (input ?? []).map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function mergeGuidanceConfig(raw: unknown): GuidanceConfig {
    if (!raw || typeof raw !== 'object') return DEFAULT_GUIDANCE_CONFIG;
    const obj = raw as Record<string, unknown>;
    const weights = (obj.weights ?? {}) as Record<string, unknown>;
    const profileKeywords = (obj.profileKeywords ?? {}) as Record<string, unknown>;

    return {
        minimumGpa:
            typeof obj.minimumGpa === 'number' && Number.isFinite(obj.minimumGpa)
                ? obj.minimumGpa
                : DEFAULT_GUIDANCE_CONFIG.minimumGpa,
        weights: {
            preferences:
                typeof weights.preferences === 'number'
                    ? weights.preferences
                    : DEFAULT_GUIDANCE_CONFIG.weights.preferences,
            transcriptFit:
                typeof weights.transcriptFit === 'number'
                    ? weights.transcriptFit
                    : DEFAULT_GUIDANCE_CONFIG.weights.transcriptFit,
            careerFit:
                typeof weights.careerFit === 'number'
                    ? weights.careerFit
                    : DEFAULT_GUIDANCE_CONFIG.weights.careerFit,
            gpaReadiness:
                typeof weights.gpaReadiness === 'number'
                    ? weights.gpaReadiness
                    : DEFAULT_GUIDANCE_CONFIG.weights.gpaReadiness,
        },
        profileKeywords: {
            BSE: Array.isArray(profileKeywords.BSE)
                ? (profileKeywords.BSE as string[])
                : DEFAULT_GUIDANCE_CONFIG.profileKeywords.BSE,
            OSCM: Array.isArray(profileKeywords.OSCM)
                ? (profileKeywords.OSCM as string[])
                : DEFAULT_GUIDANCE_CONFIG.profileKeywords.OSCM,
            IS: Array.isArray(profileKeywords.IS)
                ? (profileKeywords.IS as string[])
                : DEFAULT_GUIDANCE_CONFIG.profileKeywords.IS,
        },
    };
}

function calcKeywordFit(text: string, keywords: string[]) {
    const t = text.toLowerCase();
    if (!keywords.length) return 0;
    const hits = keywords.filter((kw) => t.includes(kw.toLowerCase())).length;
    return hits / keywords.length;
}

function getPreferencePayload(metadata: unknown) {
    if (!metadata || typeof metadata !== 'object') return null;
    const container = metadata as Record<string, unknown>;
    const raw = container.specializationPreferences;
    if (!raw || typeof raw !== 'object') return null;
    return raw as Record<string, unknown>;
}

export async function submitSpecializationPreferences(input: unknown) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const parsed = specializationPreferenceSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error('Invalid specialization preference payload.');
    }

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        include: { degree_path: true },
    });
    if (!student) throw new Error('Student not found.');
    if (student.degree_path.code !== 'MIT') {
        throw new Error('Specialization preferences are only available for MIT students.');
    }

    const metadata = (student.metadata ?? {}) as Record<string, unknown>;
    const specializationPreferences = {
        ...parsed.data,
        submittedAt: new Date().toISOString(),
        source: 'student_specialization_preferences',
    };

    await prisma.student.update({
        where: { student_id: session.user.id },
        data: {
            metadata: {
                ...metadata,
                specializationPreferences,
            },
        },
    });

    revalidatePath('/dashboard/student/specialization-preferences');
    revalidatePath('/dashboard/student/specialization');
    return { success: true };
}

export async function getSpecializationPreferences() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        include: { degree_path: true },
    });
    if (!student) throw new Error('Student not found.');
    if (student.degree_path.code !== 'MIT') {
        return { success: false, message: 'Specialization preferences are only available for MIT students.' };
    }

    const raw = getPreferencePayload(student.metadata);
    const parsed = specializationPreferenceSchema.safeParse(raw ?? {});
    if (!parsed.success) {
        return { success: true, data: null };
    }

    return { success: true, data: parsed.data };
}

/**
 * Get deterministic + Gemini-enhanced specialization guidance.
 */
export async function getSpecializationGuidance() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        include: {
            degree_path: true,
            module_registrations: {
                include: {
                    module: true,
                    grade: true,
                },
            },
        },
    });

    if (!student) {
        throw new Error('Student not found.');
    }

    if (student?.degree_path?.code !== 'MIT') {
        return { 
            isEligible: false, 
            message: "Specialization selection is only available for MIT Students." 
        };
    }

    const cfgSetting = await prisma.systemSetting.findUnique({
        where: { key: 'specialization_guidance_config' },
    });
    const config = mergeGuidanceConfig(
        cfgSetting?.value ? JSON.parse(cfgSetting.value) : null
    );

    const preferencePayload = getPreferencePayload(student.metadata);
    const parsedPrefs = specializationPreferenceSchema.safeParse(preferencePayload ?? {});
    if (!parsedPrefs.success) {
        return {
            isEligible: true,
            hasRequiredPreferences: false,
            message: 'Complete your specialization preference form to get personalized guidance.',
        };
    }

    const prefs = parsedPrefs.data;
    const transcriptRows = student.module_registrations.filter((mr) => !!mr.grade?.released_at);
    const gpa = student.current_gpa ?? 0;
    const gpaReadiness = gpa >= config.minimumGpa ? 1 : Math.max(0, gpa / Math.max(config.minimumGpa, 0.1));

    const preferenceText = [
        ...normalizeList(prefs.academicInterests),
        ...normalizeList(prefs.technicalInterests),
        ...normalizeList(prefs.learningGoals),
        ...normalizeList(prefs.skillDevelopment),
        prefs.reasoning.toLowerCase(),
        (prefs.additionalNotes ?? '').toLowerCase(),
    ].join(' ');

    const careerText = [
        ...normalizeList(prefs.careerAspirations),
        ...normalizeList(prefs.careerFocus),
        ...normalizeList(prefs.projectTypes),
        (prefs.workEnvironment ?? '').toLowerCase(),
    ].join(' ');

    const transcriptText = transcriptRows
        .map((mr) => `${mr.module.code} ${mr.module.name} ${mr.grade?.letter_grade ?? ''}`)
        .join(' ')
        .toLowerCase();

    const specializationScores = (['BSE', 'OSCM', 'IS'] as SpecializationCode[]).map((code) => {
        const keywords = config.profileKeywords[code];
        const preferenceFit = calcKeywordFit(preferenceText, keywords);
        const careerFit = calcKeywordFit(careerText, keywords);
        const transcriptFit = calcKeywordFit(transcriptText, keywords);
        const preferredBoost = prefs.preferredSpecialization === code ? 0.2 : 0;
        const alternativeBoost = prefs.alternativeSpecialization === code ? 0.08 : 0;

        const composite =
            (preferenceFit + preferredBoost + alternativeBoost) * config.weights.preferences +
            transcriptFit * config.weights.transcriptFit +
            careerFit * config.weights.careerFit +
            gpaReadiness * config.weights.gpaReadiness;

        return {
            code,
            score: clampScore(composite),
            breakdown: {
                preferenceFit: clampScore((preferenceFit + preferredBoost + alternativeBoost) * 100),
                transcriptFit: clampScore(transcriptFit * 100),
                careerFit: clampScore(careerFit * 100),
                gpaReadiness: clampScore(gpaReadiness * 100),
            },
        };
    });

    specializationScores.sort((a, b) => b.score - a.score);

    const transcriptPayload = transcriptRows.map((mr) => ({
        moduleCode: mr.module.code,
        moduleName: mr.module.name,
        letterGrade: mr.grade?.letter_grade ?? null,
        marks: mr.grade?.marks ?? null,
    }));

    const decision = await GeminiService.generateSpecializationDecision({
        currentGpa: gpa,
        preferences: prefs,
        transcript: transcriptPayload,
        deterministicBreakdown: specializationScores,
    });

    const recommended =
        specializationScores.find((s) => s.code === decision.recommended_specialization) ??
        specializationScores[0];

    const ai = await GeminiService.generateSpecializationGuidanceExplanation({
        studentId: student.student_id,
        currentGpa: gpa,
        recommendedSpecialization: recommended.code,
        score: decision.fit_score,
        scoreBreakdown: recommended.breakdown,
        preferences: prefs,
        transcript: transcriptPayload,
    });

    const deterministicSkillVector = {
        Technical: Math.round((recommended.breakdown.transcriptFit + recommended.breakdown.preferenceFit) / 2),
        Strategic: Math.round((recommended.breakdown.careerFit + recommended.breakdown.preferenceFit) / 2),
        Operations: Math.round((recommended.breakdown.careerFit + recommended.breakdown.transcriptFit) / 2),
    };

    return {
        isEligible: true,
        hasRequiredPreferences: true,
        recommended_specialization: recommended.code,
        fit_score: decision.fit_score,
        skill_vector: decision.skill_vector ?? deterministicSkillVector,
        skill_vector_source: decision.skill_vector ? 'GEMINI' : 'DETERMINISTIC_FALLBACK',
        reasons: [...decision.reasons, ...ai.reasons].slice(0, 5),
        insight: ai.insight,
        deterministic_breakdown: specializationScores,
        decision_source: decision.modelUsed ? 'GEMINI' : 'DETERMINISTIC_FALLBACK',
        decision_failure_reason: decision.failureReason,
    };
}

/**
 * Submit Specialization Selection
 */
export async function submitSpecializationSelection(specializationCode: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        select: { degree_path_id: true },
    });
    if (!student) throw new Error('Student not found');

    const spec = await prisma.specialization.findFirst({
        where: { code: specializationCode, program_id: student.degree_path_id },
    });

    if (!spec) throw new Error("Invalid specialization code.");

    await prisma.student.update({
        where: { student_id: session.user.id },
        data: { specialization_id: spec.specialization_id }
    });

    revalidatePath('/dashboard/student/specialization');
    return { success: true };
}

/**
 * Fetch Specialization Status & Meta-data
 */
export async function getSpecializationInitialData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        include: {
            degree_path: {
                include: { specializations: true }
            },
            specialization: true
        }
    });

    if (!student) throw new Error("Student record not found.");

    return {
        currentSpecialization: student.specialization,
        availableSpecializations: student.degree_path.specializations,
        degreeCode: student.degree_path.code,
        isMIT: student.degree_path.code === 'MIT'
    };
}
