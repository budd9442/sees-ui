'use server';

import { prisma } from '@/lib/db';

/**
 * Fetch all academic years for selection
 * Sorted by start date descending to show current/future cycles first
 */
/**
 * @swagger
 * /action/academic-year/getAcademicYears:
 *   post:
 *     summary: "[Server Action] List Academic Cycles"
 *     description: Returns all academic years registered in the system, sorted by start date.
 *     tags:
 *       - System Actions
 */
export async function getAcademicYears() {
    try {
        const years = await prisma.academicYear.findMany({
            orderBy: {
                start_date: 'desc'
            },
            select: {
                academic_year_id: true,
                label: true,
                active: true,
                start_date: true,
                end_date: true
            }
        });

        return {
            success: true,
            data: years.map(y => ({
                id: y.academic_year_id,
                label: y.label,
                isActive: y.active,
                startDate: y.start_date,
                endDate: y.end_date
            }))
        };
    } catch (error) {
        console.error("Failed to fetch academic years:", error);
        return { success: false, error: "Database error" };
    }
}
