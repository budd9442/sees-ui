'use server';

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { writeAuditLog } from '@/lib/audit/write-audit-log';

/**
 * Update system-wide GPA thresholds (e.g., First Class at 3.7)
 */
export async function updateAcademicThresholds(settings: Record<string, string>) {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const operations = Object.entries(settings).map(([key, value]) =>
        prisma.systemSetting.upsert({
            where: { key },
            update: { value, updated_at: new Date() },
            create: {
                setting_id: randomUUID(),
                key,
                value,
                category: 'Academic',
                updated_at: new Date(),
            },
        })
    );

    await prisma.$transaction(operations);

    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_ACADEMIC_THRESHOLDS_UPDATE',
        entityType: 'SYSTEM_SETTING',
        entityId: 'academic_thresholds',
        category: 'ADMIN',
        metadata: { keys: Object.keys(settings) },
    });

    revalidatePath('/dashboard/admin/settings/academic');
    return { success: true };
}

/**
 * Configure Grading Scheme (Points for each letter grade)
 */
export async function updateGradingScheme(schemeId: string, bands: { letter: string, points: number, minMarks: number, maxMarks: number }[]) {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    await prisma.$transaction(async (tx) => {
        // Delete existing bands for this scheme
        await tx.gradingBand.deleteMany({ where: { scheme_id: schemeId } });

        // Create new bands
        await tx.gradingBand.createMany({
            data: bands.map(b => ({
                scheme_id: schemeId,
                letter_grade: b.letter,
                grade_point: b.points,
                min_marks: b.minMarks,
                max_marks: b.maxMarks
            }))
        });
    });

    revalidatePath('/dashboard/admin/settings/academic');
    return { success: true };
}

/**
 * Initial Seeding of Settings if missing
 */
export async function ensureDefaultSettings() {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const defaults = [
        { key: 'threshold_first_class', value: '3.7', description: 'Minimum GPA for First Class' },
        { key: 'threshold_second_upper', value: '3.0', description: 'Minimum GPA for Second Upper' },
        { key: 'threshold_second_lower', value: '2.5', description: 'Minimum GPA for Second Lower' },
        { key: 'threshold_pass', value: '2.0', description: 'Minimum GPA for Pass' }
    ];

    for (const d of defaults) {
        await prisma.systemSetting.upsert({
            where: { key: d.key },
            update: {},
            create: {
                setting_id: randomUUID(),
                key: d.key,
                value: d.value,
                description: d.description,
                category: 'Academic',
                updated_at: new Date(),
            },
        });
    }

    // Default Grading Scheme
    let scheme = await prisma.gradingScheme.findFirst({ where: { name: 'Standard SEES Scheme' } });
    if (!scheme) {
        scheme = await prisma.gradingScheme.create({
            data: {
                name: 'Standard SEES Scheme',
                version: 'V1.0',
                active: true
            }
        });

        const defaultBands = [
            { letter: 'A', points: 4.0, minMarks: 75, maxMarks: 100 },
            { letter: 'B', points: 3.0, minMarks: 65, maxMarks: 74 },
            { letter: 'C', points: 2.0, minMarks: 50, maxMarks: 64 },
            { letter: 'F', points: 0.0, minMarks: 0, maxMarks: 49 }
        ];

        await prisma.gradingBand.createMany({
            data: defaultBands.map(b => ({
                scheme_id: scheme!.scheme_id,
                letter_grade: b.letter,
                grade_point: b.points,
                min_marks: b.minMarks,
                max_marks: b.maxMarks
            }))
        });
    }

    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_GRADING_ENSURE_DEFAULTS',
        entityType: 'GRADING_SCHEME',
        entityId: 'defaults',
        category: 'ADMIN',
    });

    return { success: true };
}
