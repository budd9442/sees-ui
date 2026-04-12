'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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
        // Validation
        const validLevels = ['L1', 'L2', 'L3', 'L4', 'GRADUATED'];
        if (!validLevels.includes(sourceLevel) || !validLevels.includes(targetLevel)) {
            throw new Error("Invalid level transition specified.");
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Identification: How many are moving?
            const studentsToPromote = await tx.student.findMany({
                where: { current_level: sourceLevel, enrollment_status: 'ENROLLED' },
                select: { student_id: true }
            });

            if (studentsToPromote.length === 0) {
                throw new Error(`No enrolled students found at level ${sourceLevel}.`);
            }

            // 2. Atomic Promotion
            const updateCount = await tx.student.updateMany({
                where: {
                    current_level: sourceLevel,
                    enrollment_status: 'ENROLLED'
                },
                data: {
                    current_level: targetLevel
                }
            });

            // 3. Log the history (optional: add a SystemEvent table later)
            console.log(`Barch Promotion: Moved ${updateCount.count} students from ${sourceLevel} to ${targetLevel}.`);

            return updateCount.count;
        });

        revalidatePath('/dashboard/admin/config/academic');
        return { success: true, count: result };

    } catch (error: any) {
        console.error("Batch Promotion Failed:", error);
        return { success: false, error: error.message || "Promotion operation failed" };
    }
}
