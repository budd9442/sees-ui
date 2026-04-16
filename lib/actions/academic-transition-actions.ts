'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { writeAuditLog } from '@/lib/audit/write-audit-log';
import { dispatchNotificationEmail } from '@/lib/notifications/dispatch';
import { NotificationEventKey } from '@/lib/notifications/events';

/**
 * Summarizes the student population by academic level
 */
export async function getBatchStatistics() {
    try {
        const stats = await prisma.student.groupBy({
            by: ['current_level'],
            _count: {
                student_id: true
            }
        });

        // Ensure L1, L2, L3, L4 are always represented
        const levels = ['L1', 'L2', 'L3', 'L4'];
        const formatted = levels.map(lvl => ({
            level: lvl,
            count: stats.find(s => s.current_level === lvl)?._count.student_id || 0
        }));

        return { success: true, data: formatted };
    } catch (error) {
        return { success: false, error: "Failed to fetch statistics" };
    }
}

/**
 * Vertical promotion of a student batch (L1 -> L2, etc.)
 */
export async function promoteBatch(sourceLevel: string, targetLevel: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        // Validation
        const validLevels = ['L1', 'L2', 'L3', 'L4', 'GRADUATED'];
        if (!validLevels.includes(sourceLevel) || !validLevels.includes(targetLevel)) {
            throw new Error("Invalid level transition specified.");
        }

        const studentsToPromote = await prisma.student.findMany({
            where: { current_level: sourceLevel, enrollment_status: 'ENROLLED' },
            include: { user: { select: { email: true, firstName: true, lastName: true } } },
        });

        if (studentsToPromote.length === 0) {
            throw new Error(`No enrolled students found at level ${sourceLevel}.`);
        }

        const result = await prisma.$transaction(async (tx) => {
            const updateCount = await tx.student.updateMany({
                where: {
                    current_level: sourceLevel,
                    enrollment_status: 'ENROLLED'
                },
                data: {
                    current_level: targetLevel
                }
            });

            console.log(`Batch Promotion: Moved ${updateCount.count} students from ${sourceLevel} to ${targetLevel}.`);

            return updateCount.count;
        });

        for (const s of studentsToPromote) {
            const email = s.user?.email;
            if (!email) continue;
            const studentName = `${s.user.firstName} ${s.user.lastName}`.trim();
            const dedupe = `${NotificationEventKey.ACADEMIC_CLASS_CHANGED}:${s.student_id}:${sourceLevel}->${targetLevel}`;
            await dispatchNotificationEmail({
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
        }

        await writeAuditLog({
            adminId: session.user.id,
            action: 'ADMIN_BATCH_LEVEL_PROMOTE',
            entityType: 'STUDENT_BATCH',
            entityId: `${sourceLevel}_to_${targetLevel}`,
            category: 'ADMIN',
            metadata: { count: result, sourceLevel, targetLevel },
        });

        revalidatePath('/dashboard/admin/config/academic');
        return { success: true, count: result };

    } catch (error: any) {
        console.error("Batch Promotion Failed:", error);
        return { success: false, error: error.message || "Promotion operation failed" };
    }
}
