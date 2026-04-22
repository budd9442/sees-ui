'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { writeAuditLog } from '@/lib/audit/write-audit-log';

/**
 * Fetch all academic years with impact statistics for Admin
 */
/**
 * @swagger
 * /action/academic-year/getAdminAcademicYears:
 *   post:
 *     summary: "[Server Action] List Academic Years (Admin)"
 *     description: Returns a comprehensive list of all academic years with associated statistics like semester and program counts.
 *     tags:
 *       - Academic Year Actions
 *     responses:
 *       200:
 *         description: Successfully fetched academic years
 */
export async function getAdminAcademicYears() {
    try {
        const years = await prisma.academicYear.findMany({
            orderBy: {
                start_date: 'desc'
            },
            include: {
                _count: {
                    select: {
                        semesters: true,
                        programs: true
                    }
                }
            }
        });

        const now = new Date();
        return {
            success: true,
            data: years.map(y => ({
                id: y.academic_year_id,
                label: y.label,
                startDate: y.start_date,
                endDate: y.end_date,
                isActive: now >= y.start_date && now <= y.end_date,
                stats: {
                    semesterCount: y._count.semesters,
                    intakeCount: y._count.programs
                }
            }))
        };
    } catch (error) {
        console.error("Failed to fetch admin academic years:", error);
        return { success: false, error: "Database lookup failed" };
    }
}

/**
 * Create a new Academic Year and auto-provision semeters
 */
/**
 * @swagger
 * /action/academic-year/createAcademicYear:
 *   post:
 *     summary: "[Server Action] Create Academic Year"
 *     description: Initializes a new academic year cycle and automatically provisions two semesters.
 *     tags:
 *       - Academic Year Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Successfully created academic year
 */
export async function createAcademicYear(data: {
    label: string,
    startDate: Date,
    endDate: Date
}) {
    try {
        const session = await auth();
        if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        // Validation: Unique label
        const existing = await prisma.academicYear.findUnique({
            where: { label: data.label }
        });
        if (existing) throw new Error("An academic year with this label already exists.");

        // Create Year and Auto-Provision 2 Semesters in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const year = await tx.academicYear.create({
                data: {
                    label: data.label,
                    start_date: data.startDate,
                    end_date: data.endDate,
                    active: false // New years are not active by default
                }
            });

            // Calculate mid-point for semester split
            const midTime = data.startDate.getTime() + (data.endDate.getTime() - data.startDate.getTime()) / 2;
            const midDate = new Date(midTime);

            // Create Semesters
            await tx.semester.createMany({
                data: [
                    {
                        label: "Semester 1",
                        academic_year_id: year.academic_year_id,
                        start_date: data.startDate,
                        end_date: midDate,
                    },
                    {
                        label: "Semester 2",
                        academic_year_id: year.academic_year_id,
                        start_date: new Date(midTime + 1000 * 60 * 60 * 24), // Day after mid
                        end_date: data.endDate,
                    },
                ],
            });

            return year;
        });

        await writeAuditLog({
            adminId: session.user.id,
            action: 'ADMIN_ACADEMIC_YEAR_CREATE',
            entityType: 'ACADEMIC_YEAR',
            entityId: result.academic_year_id,
            category: 'ADMIN',
            metadata: { label: data.label },
        });

        revalidatePath('/dashboard/admin/config/academic');
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Failed to create academic year:", error);
        return { success: false, error: error.message || "Failed to create record" };
    }
}

/**
 * Set a specific year as the system's "Current/Active" cycle
 */
/**
 * @swagger
 * /action/academic-year/setActiveAcademicYear:
 *   post:
 *     summary: "[Server Action] Set Active Academic Cycle"
 *     description: Activates a specific academic year and deactivates all others. This is the system-wide 'current' cycle.
 *     tags:
 *       - Academic Year Actions
 */
export async function setActiveAcademicYear(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.$transaction([
            // 1. Deactivate all others
            prisma.academicYear.updateMany({
                where: { active: true },
                data: { active: false }
            }),
            // 2. Activate target
            prisma.academicYear.update({
                where: { academic_year_id: id },
                data: { active: true }
            })
        ]);

        await writeAuditLog({
            adminId: session.user.id,
            action: 'ADMIN_ACADEMIC_YEAR_SET_ACTIVE',
            entityType: 'ACADEMIC_YEAR',
            entityId: id,
            category: 'ADMIN',
        });

        revalidatePath('/dashboard/admin/config/academic');
        return { success: true };
    } catch (error) {
        console.error("Failed to set active year:", error);
        return { success: false, error: "Lifecycle transition failed" };
    }
}

/**
 * Delete an academic year (only if it has no critical links)
 */
/**
 * @swagger
 * /action/academic-year/deleteAcademicYear:
 *   post:
 *     summary: "[Server Action] Delete Academic Year"
 *     description: Removes an academic year and its semesters if no student or staff records are linked to it.
 *     tags:
 *       - Academic Year Actions
 */
export async function deleteAcademicYear(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        const year = await prisma.academicYear.findUnique({
            where: { academic_year_id: id },
            include: {
                _count: {
                    select: {
                        staff_assignments: true,
                        intakes: true
                    }
                }
            }
        });

        if (!year) throw new Error("Year not found");
        
        if (year.active) {
            throw new Error("Cannot delete the active academic cycle. Please switch to another year first.");
        }

        if (year._count.staff_assignments > 0 || year._count.intakes > 0) {
            throw new Error("This year has active staff assignments or student intakes. Please migrate or delete those records first.");
        }

        // Delete semesters and year
        await prisma.$transaction([
            prisma.semester.deleteMany({ where: { academic_year_id: id } }),
            prisma.academicYear.delete({ where: { academic_year_id: id } })
        ]);

        await writeAuditLog({
            adminId: session.user.id,
            action: 'ADMIN_ACADEMIC_YEAR_DELETE',
            entityType: 'ACADEMIC_YEAR',
            entityId: id,
            category: 'ADMIN',
        });

        revalidatePath('/dashboard/admin/config/academic');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
/**
 * Update an existing Academic Year
 */
/**
 * @swagger
 * /action/academic-year/updateAcademicYear:
 *   post:
 *     summary: "[Server Action] Update Academic Year"
 *     description: Modifies the label and date range of an existing academic year, re-syncing default semesters.
 *     tags:
 *       - Academic Year Actions
 */
export async function updateAcademicYear(id: string, data: {
    label: string,
    startDate: Date,
    endDate: Date
}) {
    try {
        const session = await auth();
        if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        // Validation: Unique label (excluding current)
        const duplicate = await prisma.academicYear.findFirst({
            where: { 
                label: data.label,
                NOT: { academic_year_id: id }
            }
        });
        if (duplicate) throw new Error("Another academic year with this label already exists.");

        const result = await prisma.$transaction(async (tx) => {
            const year = await tx.academicYear.update({
                where: { academic_year_id: id },
                data: {
                    label: data.label,
                    start_date: data.startDate,
                    end_date: data.endDate
                }
            });

            // Re-sync Semesters if they are the default 2
            const semesters = await tx.semester.findMany({
                where: { academic_year_id: id },
                orderBy: { start_date: 'asc' }
            });

            if (semesters.length === 2) {
                const midTime = data.startDate.getTime() + (data.endDate.getTime() - data.startDate.getTime()) / 2;
                const midDate = new Date(midTime);

                await tx.semester.update({
                    where: { semester_id: semesters[0].semester_id },
                    data: {
                        start_date: data.startDate,
                        end_date: midDate
                    }
                });

                await tx.semester.update({
                    where: { semester_id: semesters[1].semester_id },
                    data: {
                        start_date: new Date(midTime + 1000 * 60 * 60 * 24),
                        end_date: data.endDate
                    }
                });
            }

            return year;
        });

        await writeAuditLog({
            adminId: session.user.id,
            action: 'ADMIN_ACADEMIC_YEAR_UPDATE',
            entityType: 'ACADEMIC_YEAR',
            entityId: id,
            category: 'ADMIN',
            metadata: { label: data.label },
        });

        revalidatePath('/dashboard/admin/config/academic');
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Failed to update academic year:", error);
        return { success: false, error: error.message || "Failed to update record" };
    }
}
