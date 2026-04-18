'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { GrokService } from '@/lib/services/grok-service';
import { assertStudentWriteAccess } from '@/lib/actions/student-access';

const pathwayGuidancePreferenceSchema = z.object({
    interests: z.array(z.string().trim()).min(2),
    strengths: z.array(z.string().trim()).min(2),
    careerGoals: z.array(z.string().trim()).min(2),
    reasoning: z.string().trim().min(50),
    workStyle: z.string().trim().optional(),
    learningStyle: z.string().trim().optional(),
    industryInterest: z.array(z.string().trim()).optional(),
    additionalNotes: z.string().trim().optional(),
});

function getPathwayPreferencePayload(metadata: unknown) {
    if (!metadata || typeof metadata !== 'object') return null;
    const container = metadata as Record<string, unknown>;
    const raw = container.pathwayPreferences;
    if (!raw || typeof raw !== 'object') return null;
    return raw as Record<string, unknown>;
}

function normalizeList(input?: string[] | null) {
    return (input ?? []).map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function calcKeywordFit(text: string, keywords: string[]) {
    if (!keywords.length) return 0;
    const t = text.toLowerCase();
    const hits = keywords.filter((kw) => t.includes(kw.toLowerCase())).length;
    return hits / keywords.length;
}

function clampScore(n: number) {
    return Math.max(0, Math.min(100, Number(n.toFixed(2))));
}

export async function submitPathwayGuidancePreferences(input: unknown) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    await assertStudentWriteAccess(session.user.id);

    const parsed = pathwayGuidancePreferenceSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error('Invalid pathway preference payload.');
    }

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
    });
    if (!student) throw new Error('Student not found.');

    const metadata = (student.metadata ?? {}) as Record<string, unknown>;
    await prisma.student.update({
        where: { student_id: session.user.id },
        data: {
            metadata: {
                ...metadata,
                pathwayPreferences: {
                    ...parsed.data,
                    submittedAt: new Date().toISOString(),
                    source: 'student_pathway_preferences',
                },
            },
        },
    });

    revalidatePath('/dashboard/student/pathway-preferences');
    revalidatePath('/dashboard/student/pathway');
    return { success: true };
}

export async function getPathwayGuidancePreferences() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
    });
    if (!student) throw new Error('Student not found.');

    const raw = getPathwayPreferencePayload(student.metadata);
    const parsed = pathwayGuidancePreferenceSchema.safeParse(raw ?? {});
    if (!parsed.success) return { success: true, data: null };
    return { success: true, data: parsed.data };
}

export async function getPathwayGuidance() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        include: {
            module_registrations: {
                include: {
                    module: true,
                    grade: true,
                },
            },
        },
    });
    if (!student) throw new Error('Student not found.');

    const rawPrefs = getPathwayPreferencePayload(student.metadata);
    const parsedPrefs = pathwayGuidancePreferenceSchema.safeParse(rawPrefs ?? {});
    if (!parsedPrefs.success) {
        return {
            isEligible: true,
            hasRequiredPreferences: false,
            message: 'Complete your pathway preference form to get personalized guidance.',
        };
    }

    const prefs = parsedPrefs.data;
    const transcriptRows = student.module_registrations.filter((mr) => !!mr.grade?.released_at);
    const transcriptText = transcriptRows
        .map((mr) => `${mr.module.code} ${mr.module.name} ${mr.grade?.letter_grade ?? ''}`)
        .join(' ')
        .toLowerCase();

    const preferenceText = [
        ...normalizeList(prefs.interests),
        ...normalizeList(prefs.strengths),
        ...normalizeList(prefs.careerGoals),
        ...normalizeList(prefs.industryInterest),
        (prefs.workStyle ?? '').toLowerCase(),
        (prefs.learningStyle ?? '').toLowerCase(),
        prefs.reasoning.toLowerCase(),
        (prefs.additionalNotes ?? '').toLowerCase(),
    ].join(' ');

    const mitKeywords = [
        'business', 'management', 'project', 'operations', 'process', 'consulting', 'strategy', 'leadership',
    ];
    const itKeywords = [
        'programming', 'software', 'development', 'technical', 'systems', 'engineering', 'network', 'infrastructure',
    ];

    const mitScore = clampScore((calcKeywordFit(preferenceText, mitKeywords) * 70) + (calcKeywordFit(transcriptText, mitKeywords) * 30));
    const itScore = clampScore((calcKeywordFit(preferenceText, itKeywords) * 70) + (calcKeywordFit(transcriptText, itKeywords) * 30));

    const deterministicBreakdown = [
        {
            code: 'MIT' as const,
            score: mitScore,
            breakdown: {
                preferenceFit: clampScore(calcKeywordFit(preferenceText, mitKeywords) * 100),
                transcriptFit: clampScore(calcKeywordFit(transcriptText, mitKeywords) * 100),
            },
        },
        {
            code: 'IT' as const,
            score: itScore,
            breakdown: {
                preferenceFit: clampScore(calcKeywordFit(preferenceText, itKeywords) * 100),
                transcriptFit: clampScore(calcKeywordFit(transcriptText, itKeywords) * 100),
            },
        },
    ].sort((a, b) => b.score - a.score);

    const transcriptPayload = transcriptRows.map((mr) => ({
        moduleCode: mr.module.code,
        moduleName: mr.module.name,
        letterGrade: mr.grade?.letter_grade ?? null,
        marks: mr.grade?.marks ?? null,
    }));

    const decision = await GrokService.generatePathwayDecision({
        currentGpa: student.current_gpa ?? 0,
        preferences: prefs,
        transcript: transcriptPayload,
        deterministicBreakdown,
    });

    const recommended = deterministicBreakdown.find((s) => s.code === decision.primary_recommendation) ?? deterministicBreakdown[0];
    const explanation = await GrokService.generatePathwayGuidanceExplanation({
        currentGpa: student.current_gpa ?? 0,
        recommendedPathway: recommended.code,
        score: decision.fit_score,
        preferences: prefs,
        transcript: transcriptPayload,
    });

    const deterministicSkillVector = {
        Technical: recommended.code === 'IT' ? 82 : 62,
        Strategic: recommended.code === 'MIT' ? 86 : 58,
        Operations: recommended.code === 'MIT' ? 80 : 60,
    };

    return {
        isEligible: true,
        hasRequiredPreferences: true,
        primary_recommendation: recommended.code,
        fit_score: decision.fit_score,
        skill_vector: decision.skill_vector ?? deterministicSkillVector,
        skill_vector_source: decision.skill_vector ? 'GROK' : 'DETERMINISTIC_FALLBACK',
        supporting_reasons: [...decision.supporting_reasons, ...explanation.supporting_reasons].slice(0, 5),
        insight: explanation.insight,
        deterministic_breakdown: deterministicBreakdown,
        decision_source: decision.modelUsed ? 'GROK' : 'DETERMINISTIC_FALLBACK',
        decision_failure_reason: decision.failureReason,
    };
}

/**
 * Submit ranked pathway preferences for a student.
 */
export async function submitPathwayPreferences(preferences: {
    preference1: string; // Program ID or Code
    preference2: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await assertStudentWriteAccess(session.user.id);

    // [GOVERNANCE] Check if pathway selection window is open
    const windowSetting = await prisma.systemSetting.findUnique({ where: { key: 'is_pathway_selection_open' } });
    if (windowSetting?.value !== 'true') {
        throw new Error("Pathway selection is currently CLOSED by administration.");
    }

    // 1. Resolve codes to IDs if necessary
    const [p1, p2] = await Promise.all([
        prisma.degreeProgram.findFirst({ where: { code: preferences.preference1 } }),
        prisma.degreeProgram.findFirst({ where: { code: preferences.preference2 } }),
    ]);

    if (!p1 || !p2) throw new Error("Invalid degree program selected.");

    // 2. Update student record
    await prisma.student.update({
        where: { student_id: session.user.id },
        data: {
            pathway_preference_1_id: p1.program_id,
            pathway_preference_2_id: p2.program_id,
            pathway_selection_date: new Date()
        }
    });

    revalidatePath('/dashboard/student/pathway');
    return { success: true };
}

/**
 * Get allocation statistics for administrative staff.
 */
export async function getPathwayAllocationStatus() {
    const session = await auth();
    // In a real app, we'd check for STAFF/ADMIN role here
    if (!session?.user?.id) throw new Error("Unauthorized");

    const programs = await prisma.degreeProgram.findMany({
        where: { active: true },
        include: {
            intakes: {
                where: { status: 'OPEN' },
                orderBy: { academic_year: { start_date: 'desc' } },
                take: 1
            }
        }
    });

    const stats = await Promise.all(programs.map(async (prog) => {
        const pref1Count = await prisma.student.count({
            where: { pathway_preference_1_id: prog.program_id }
        });
        const pref2Count = await prisma.student.count({
            where: { pathway_preference_2_id: prog.program_id }
        });

        return {
            programId: prog.program_id,
            code: prog.code,
            name: prog.name,
            pref1Count,
            pref2Count,
            capacity: prog.intakes[0]?.max_students || 60
        };
    }));

    return stats;
}

/**
 * Run the GPA-based allocation engine.
 * This is a highly destructive administrative action.
 */
export async function runPathwayAllocation() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await prisma.$transaction(async (tx) => {
        // 1. Get all L1 students with their preferences and current GPA
        const students = await tx.student.findMany({
            where: { current_level: 'Level 1' },
            orderBy: { current_gpa: 'desc' },
            include: {
                preference_1: true,
                preference_2: true
            }
        });

        // 2. Get program capacities
        const rawPrograms = await tx.degreeProgram.findMany({
            include: {
                intakes: { where: { status: 'OPEN' } }
            }
        });

        const capacities: Record<string, number> = {};
        const currentEnrollment: Record<string, number> = {};

        rawPrograms.forEach(p => {
            capacities[p.program_id] = p.intakes[0]?.max_students || 60;
            currentEnrollment[p.program_id] = 0;
        });

        const updates = [];

        // 3. GPA-Ranked Greedy Allocation
        for (const student of students) {
            let assignedId = null;

            // Try Preference 1
            if (student.pathway_preference_1_id && currentEnrollment[student.pathway_preference_1_id] < capacities[student.pathway_preference_1_id]) {
                assignedId = student.pathway_preference_1_id;
            } 
            // Try Preference 2
            else if (student.pathway_preference_2_id && currentEnrollment[student.pathway_preference_2_id] < capacities[student.pathway_preference_2_id]) {
                assignedId = student.pathway_preference_2_id;
            }
            // Fallback (e.g. to IT which usually has space if MIT is full)
            else {
                const itProg = rawPrograms.find(p => p.code === 'IT');
                if (itProg) assignedId = itProg.program_id;
            }

            if (assignedId) {
                currentEnrollment[assignedId]++;
                updates.push(tx.student.update({
                    where: { student_id: student.student_id },
                    data: {
                        degree_path_id: assignedId,
                        pathway_locked: true
                    }
                }));
            }
        }

        await Promise.all(updates);

        return { 
            success: true, 
            totalProcessed: updates.length,
            distribution: currentEnrollment
        };
    });
}
