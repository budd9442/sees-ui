'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { evaluateStudentEligibility } from '@/lib/graduation/student-eligibility';
import { parseGraduationRulesDocument, type GraduationRulesDocument } from '@/lib/graduation/rule-schema';
import type { PresetId } from '@/lib/graduation/rule-presets';
import { getPresetRules, PRESET_IDS } from '@/lib/graduation/rule-presets';
import { writeAuditLog } from '@/lib/audit/write-audit-log';

async function requireHodOrAdmin() {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role;
    if (!session?.user?.id || (role !== 'hod' && role !== 'admin')) {
        throw new Error('Unauthorized');
    }
    return { session, role: role! };
}

async function resolveStaffId(userId: string): Promise<string | null> {
    const staff = await prisma.staff.findUnique({ where: { staff_id: userId } });
    return staff?.staff_id ?? null;
}

export async function listGraduationProgramsForEditor() {
    await requireHodOrAdmin();
    const programs = await prisma.degreeProgram.findMany({
        where: { active: true },
        orderBy: { code: 'asc' },
        include: {
            graduation_eligibility_profile: true,
        },
    });
    return programs.map((p) => ({
        program_id: p.program_id,
        code: p.code,
        name: p.name,
        hasProfile: !!p.graduation_eligibility_profile,
        rules: (p.graduation_eligibility_profile?.rules ?? null) as unknown,
        profileVersion: p.graduation_eligibility_profile?.version ?? null,
        updated_at: p.graduation_eligibility_profile?.updated_at?.toISOString() ?? null,
    }));
}

export async function getGraduationEligibilityProfile(programId: string) {
    await requireHodOrAdmin();
    const profile = await prisma.graduationEligibilityProfile.findUnique({
        where: { program_id: programId },
    });
    if (!profile) return null;
    return {
        profile_id: profile.profile_id,
        program_id: profile.program_id,
        rules: profile.rules as unknown,
        version: profile.version,
        updated_at: profile.updated_at,
    };
}

export async function upsertGraduationEligibilityProfile(programId: string, rules: unknown) {
    const { session } = await requireHodOrAdmin();
    const doc = parseGraduationRulesDocument(rules);

    const program = await prisma.degreeProgram.findUnique({ where: { program_id: programId } });
    if (!program) throw new Error('Program not found');

    const existing = await prisma.graduationEligibilityProfile.findUnique({
        where: { program_id: programId },
    });
    const nextVersion = (existing?.version ?? 0) + 1;
    const toSave: GraduationRulesDocument = { ...doc, version: nextVersion };

    const staffId = await resolveStaffId(session.user!.id);

    await prisma.graduationEligibilityProfile.upsert({
        where: { program_id: programId },
        create: {
            profile_id: randomUUID(),
            program_id: programId,
            rules: toSave as object,
            version: nextVersion,
            updated_by_staff_id: staffId,
        },
        update: {
            rules: toSave as object,
            version: nextVersion,
            updated_by_staff_id: staffId,
        },
    });

    await writeAuditLog({
        adminId: session.user!.id,
        action: 'GRADUATION_ELIGIBILITY_PROFILE_UPSERT',
        entityType: 'GRADUATION_ELIGIBILITY_PROFILE',
        entityId: programId,
        category: 'STAFF',
        metadata: { version: nextVersion },
    });

    await syncThresholdSettingsFromMinGpaRules(toSave);

    revalidatePath('/dashboard/hod/graduation-rules');
    revalidatePath('/dashboard/hod/eligible');
    revalidatePath('/dashboard/hod/rankings');
    revalidatePath('/dashboard/hod/reports');
    return { ok: true, version: nextVersion };
}

/** Best-effort: keep legacy SystemSetting keys aligned when rules are GPA-only per division. */
async function syncThresholdSettingsFromMinGpaRules(doc: GraduationRulesDocument) {
    const order = doc.evaluationOrder;
    const extractMinGpa = (id: (typeof order)[number]) => {
        const div = doc.divisions[id];
        if (!div || div.conditions.length !== 1) return null;
        const c = div.conditions[0];
        if (c.type !== 'min_gpa') return null;
        return c.minGpa;
    };

    const first = extractMinGpa('FIRST_CLASS');
    const upper = extractMinGpa('SECOND_UPPER');
    const lower = extractMinGpa('SECOND_LOWER');
    const third = extractMinGpa('THIRD_PASS');
    if (first == null || upper == null || lower == null || third == null) return;

    const upsert = async (key: string, value: string) => {
        await prisma.systemSetting.upsert({
            where: { key },
            create: {
                setting_id: randomUUID(),
                key,
                value,
                category: 'GPA',
                updated_at: new Date(),
            },
            update: { value, updated_at: new Date() },
        });
    };

    await upsert('threshold_first_class', String(first));
    await upsert('threshold_second_upper', String(upper));
    await upsert('threshold_second_lower', String(lower));
    await upsert('threshold_third_class', String(third));

    await prisma.systemSetting.upsert({
        where: { key: 'gpa_academic_class_thresholds' },
        create: {
            setting_id: randomUUID(),
            key: 'gpa_academic_class_thresholds',
            value: JSON.stringify({
                firstClass: first,
                secondUpper: upper,
                secondLower: lower,
                thirdPass: third,
            }),
            category: 'GPA',
            updated_at: new Date(),
        },
        update: {
            value: JSON.stringify({
                firstClass: first,
                secondUpper: upper,
                secondLower: lower,
                thirdPass: third,
            }),
            updated_at: new Date(),
        },
    });
}

export async function applyGraduationPreset(programId: string, presetId: PresetId) {
    if (!PRESET_IDS.includes(presetId)) throw new Error('Invalid preset');
    const rules = getPresetRules(presetId);
    return upsertGraduationEligibilityProfile(programId, rules);
}

export async function previewGraduationEligibility(studentId: string) {
    await requireHodOrAdmin();
    return evaluateStudentEligibility(studentId);
}

export async function searchStudentsForGraduationPreview(query: string) {
    await requireHodOrAdmin();
    const q = query.trim();
    if (q.length < 2) return [];

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { email: { contains: q, mode: 'insensitive' } },
                { username: { contains: q, mode: 'insensitive' } },
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
            ],
            student: { isNot: null },
        },
        take: 15,
        include: {
            student: {
                include: {
                    degree_path: { select: { code: true, name: true } },
                },
            },
        },
    });

    return users.map((u) => ({
        student_id: u.user_id,
        label: `${u.firstName} ${u.lastName} (${u.student!.degree_path.code})`,
        programCode: u.student!.degree_path.code,
    }));
}
