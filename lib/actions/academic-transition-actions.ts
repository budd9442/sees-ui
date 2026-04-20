'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { writeAuditLog } from '@/lib/audit/write-audit-log';
import { dispatchNotificationEmail } from '@/lib/notifications/dispatch';
import { NotificationEventKey } from '@/lib/notifications/events';

const BATCH_LEVELS = ['L1', 'L2', 'L3', 'L4', 'GRADUATED'] as const;
const LEGAL_TRANSITIONS: Record<string, string> = {
    L1: 'L2',
    L2: 'L3',
    L3: 'L4',
    L4: 'GRADUATED',
};

type BatchLevel = (typeof BATCH_LEVELS)[number];

const BATCH_LEVEL_TO_DB: Record<BatchLevel, string> = {
    L1: 'Level 1',
    L2: 'Level 2',
    L3: 'Level 3',
    L4: 'Level 4',
    GRADUATED: 'GRADUATED',
};

function dbLevelToBatchLevel(currentLevel: string | null): BatchLevel | null {
    if (!currentLevel) return null;
    if (currentLevel === 'Level 1') return 'L1';
    if (currentLevel === 'Level 2') return 'L2';
    if (currentLevel === 'Level 3') return 'L3';
    if (currentLevel === 'Level 4') return 'L4';
    if (currentLevel.toUpperCase() === 'GRADUATED') return 'GRADUATED';
    return null;
}

async function requireBatchOperator() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    const userId = session?.user?.id;

    if (!userId || (role !== 'admin' && role !== 'hod')) {
        return { ok: false as const, error: 'Unauthorized' };
    }

    return { ok: true as const, userId, role };
}

/**
 * Summarizes the student population by academic level
 */
export async function getBatchOverviewForOperator() {
    try {
        const operator = await requireBatchOperator();
        if (!operator.ok) return { success: false, error: operator.error };

        const stats = await prisma.student.groupBy({
            by: ['current_level'],
            _count: {
                student_id: true
            }
        });

        const counts: Record<BatchLevel, number> = {
            L1: 0,
            L2: 0,
            L3: 0,
            L4: 0,
            GRADUATED: 0,
        };
        for (const row of stats) {
            const mapped = dbLevelToBatchLevel(row.current_level);
            if (mapped) counts[mapped] += row._count.student_id;
        }
        const formatted = BATCH_LEVELS.map((lvl) => ({
            level: lvl,
            count: counts[lvl],
        }));

        return { success: true, data: formatted };
    } catch (error) {
        return { success: false, error: "Failed to fetch statistics" };
    }
}

/**
 * Backward-compatible level summary for existing admin page.
 */
export async function getBatchStatistics() {
    const overview = await getBatchOverviewForOperator();
    if (!overview.success || !overview.data) return overview;
    return {
        success: true as const,
        data: overview.data.filter(row => row.level !== 'GRADUATED'),
    };
}

/**
 * Detailed student and status breakdown for one batch.
 */
export async function getBatchDetailsForOperator(level: string) {
    try {
        const operator = await requireBatchOperator();
        if (!operator.ok) return { success: false, error: operator.error };

        if (!BATCH_LEVELS.includes(level as BatchLevel)) {
            throw new Error('Invalid batch level specified.');
        }

        const where =
            level === 'GRADUATED'
                ? { OR: [{ current_level: BATCH_LEVEL_TO_DB.GRADUATED }, { graduation_status: 'GRADUATED' }] }
                : { current_level: BATCH_LEVEL_TO_DB[level as BatchLevel] };
        const [students, enrollmentBuckets] = await Promise.all([
            prisma.student.findMany({
                where,
                orderBy: { student_id: 'asc' },
                take: 300,
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    degree_path: { select: { name: true, code: true } },
                    specialization: { select: { name: true, code: true } },
                },
            }),
            prisma.student.groupBy({
                by: ['enrollment_status'],
                where,
                _count: { student_id: true },
            }),
        ]);

        const total = students.length;
        const enrolled = enrollmentBuckets.find((b) => b.enrollment_status === 'ENROLLED')?._count.student_id ?? 0;
        const promotedReady = level === 'GRADUATED' ? 0 : enrolled;

        return {
            success: true,
            data: {
                level,
                summary: {
                    totalStudents: total,
                    enrolledCount: enrolled,
                    promotedReadyCount: promotedReady,
                    exceptionsCount: Math.max(total - promotedReady, 0),
                    graduatesCount: level === 'GRADUATED' ? total : 0,
                    enrollmentBuckets: enrollmentBuckets.map((bucket) => ({
                        status: bucket.enrollment_status,
                        count: bucket._count.student_id,
                    })),
                },
                students: students.map((student) => ({
                    studentId: student.student_id,
                    fullName: `${student.user.firstName} ${student.user.lastName}`.trim(),
                    email: student.user.email,
                    level: student.current_level,
                    enrollmentStatus: student.enrollment_status,
                    degreeProgram: student.degree_path?.name ?? null,
                    degreeProgramCode: student.degree_path?.code ?? null,
                    specialization: student.specialization?.name ?? null,
                    gpa: student.current_gpa,
                    admissionYear: student.admission_year,
                    graduationStatus: student.graduation_status ?? null,
                    graduatedAt: student.graduated_at?.toISOString() ?? null,
                })),
            },
        };
    } catch (error: any) {
        console.error('Failed to fetch batch details:', error);
        return { success: false, error: error.message || 'Failed to fetch batch details' };
    }
}

/**
 * Vertical promotion of a student batch (L1 -> L2, etc.)
 */
export async function executeBatchTransition(sourceLevel: string, targetLevel: string) {
    try {
        const operator = await requireBatchOperator();
        if (!operator.ok) return { success: false, error: operator.error };

        if (!BATCH_LEVELS.includes(sourceLevel as BatchLevel) || !BATCH_LEVELS.includes(targetLevel as BatchLevel)) {
            throw new Error('Invalid level transition specified.');
        }
        if (sourceLevel === targetLevel) {
            throw new Error('Source and target levels cannot be the same.');
        }
        if (LEGAL_TRANSITIONS[sourceLevel] !== targetLevel) {
            throw new Error(`Illegal transition. Allowed transition is ${sourceLevel} -> ${LEGAL_TRANSITIONS[sourceLevel] ?? 'N/A'}.`);
        }

        const sourceDbLevel = BATCH_LEVEL_TO_DB[sourceLevel as BatchLevel];
        const targetDbLevel = BATCH_LEVEL_TO_DB[targetLevel as BatchLevel];

        const studentsToPromote = await prisma.student.findMany({
            where: { current_level: sourceDbLevel, enrollment_status: 'ENROLLED' },
            include: { user: { select: { email: true, firstName: true, lastName: true } } },
        });

        if (studentsToPromote.length === 0) {
            throw new Error(`No enrolled students found at level ${sourceLevel}.`);
        }

        const result = await prisma.$transaction(async (tx) => {
            const updateCount = await tx.student.updateMany({
                where: {
                    current_level: sourceDbLevel,
                    enrollment_status: 'ENROLLED'
                },
                data: {
                    current_level: targetDbLevel,
                    ...(targetLevel === 'GRADUATED'
                        ? {
                            graduation_status: 'GRADUATED',
                            graduated_at: new Date(),
                        }
                        : {}),
                }
            });

            return updateCount.count;
        }, {
            maxWait: 10000, // 10s to get a connection
            timeout: 20000, // 20s for the transaction to complete
        });

        // Fire and forget emails to keep the UI responsive and prevent pool exhaustion
        // dispatchNotificationEmail handles its own errors and logs them to DB
        Promise.all(studentsToPromote.map(async (s) => {
            const email = s.user?.email;
            if (!email) return;
            const studentName = `${s.user.firstName} ${s.user.lastName}`.trim();
            const dedupe = `${NotificationEventKey.ACADEMIC_CLASS_CHANGED}:${s.student_id}:${sourceLevel}->${targetLevel}`;
            return dispatchNotificationEmail({
                eventKey: NotificationEventKey.ACADEMIC_CLASS_CHANGED,
                dedupeKey: dedupe,
                to: email,
                toName: studentName,
                recipientUserId: s.student_id,
                entityType: 'student',
                entityId: s.student_id,
                vars: {
                    studentName,
                    previousLevel: sourceLevel,
                    newLevel: targetLevel,
                },
            });
        })).catch(err => console.error('[BATCH] Background email dispatch failed:', err));

        await writeAuditLog({
            adminId: operator.userId,
            action: operator.role === 'admin' ? 'ADMIN_BATCH_LEVEL_PROMOTE' : 'HOD_BATCH_LEVEL_PROMOTE',
            entityType: 'STUDENT_BATCH',
            entityId: `${sourceLevel}_to_${targetLevel}`,
            category: 'ADMIN',
            metadata: { count: result, sourceLevel, targetLevel, operatorRole: operator.role },
        });

        revalidatePath('/dashboard/admin/config/academic');
        revalidatePath('/dashboard/hod/batches');
        return { success: true, count: result };

    } catch (error: any) {
        console.error("Batch Promotion Failed:", error);
        return { success: false, error: error.message || "Promotion operation failed" };
    }
}

/**
 * Backward-compatible wrapper for current admin UI calls.
 */
export async function promoteBatch(sourceLevel: string, targetLevel: string) {
    return executeBatchTransition(sourceLevel, targetLevel);
}
