'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { AcademicEngine } from '@/lib/services/academic-engine';
import { getStudentModuleRegistrationWindow } from '@/lib/actions/module-registration-round-actions';
import { assertStudentWriteAccess } from '@/lib/actions/student-access';

/**
 * Register a student for a list of modules.
 * This is a transactional "Sync" operation.
 * It will add new registrations and remove deselected ones (that aren't already completed).
 */
/**
 * @swagger
 * /action/enrollment/registerForModules:
 *   post:
 *     summary: "[Server Action] Register Student for Modules"
 *     description: Enrolls a student in a set of academic modules for the active semester, performing prerequisite and capacity checks.
 *     tags:
 *       - Enrollment Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successfully updated registrations
 */
export async function registerForModules(moduleIds: string[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const studentId = session.user.id; // Corrected to use user.id (which is student_id in current schema)
    
    // In current dev, the session user.id is already the student_id or can be found.
    // Let's assume user.id === student_id for simplicity, else fetch.
    const student = await prisma.student.findUnique({
        where: { student_id: studentId },
    });

    if (!student) throw new Error("Student profile not found.");
    await assertStudentWriteAccess(student.student_id);

    const regWindow = await getStudentModuleRegistrationWindow();
    if (!regWindow.canEdit) {
        throw new Error(regWindow.message || 'Module registration is closed.');
    }

    // 1. Get current active semester
    // Using a simplified helper for now
    const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
    const semester = await prisma.semester.findFirst({
        where: { 
            academic_year_id: activeYear?.academic_year_id || undefined,
            name: "Semester 1" // Default
        } as any
    });

    if (!semester) throw new Error("No active semester found for registration.");
    const semesterId = semester.semester_id;

    // 2. Comprehensive Validation
    // A. Credit Load
    const creditCheck = await AcademicEngine.validateCreditLoad(studentId, semesterId, moduleIds);
    if (!creditCheck.allowed) {
        throw new Error(`Registration failed: Total credits (${creditCheck.totalCredits}) exceeds the limit of ${creditCheck.limit}.`);
    }

    // B. Prerequisites & Capacity for NEW modules
    const existingRegs = await prisma.moduleRegistration.findMany({
        where: { student_id: studentId, semester_id: semesterId, status: 'REGISTERED' }
    });
    const currentIds = new Set(existingRegs.map(r => r.module_id));
    const toAdd = moduleIds.filter(id => !currentIds.has(id));

    for (const moduleId of toAdd) {
        // Prereq Check
        const prereqCheck = await AcademicEngine.validatePrerequisites(studentId, moduleId);
        if (!prereqCheck.isEligible) {
            throw new Error(`Registration failed for module: Missing prerequisites: ${prereqCheck.missingCodes.join(', ')}`);
        }

        // Capacity Check
        const capacityCheck = await AcademicEngine.validateCapacity(moduleId, semesterId);
        if (!capacityCheck.hasSpace) {
            throw new Error(`Registration failed for module: Capacity reached (${capacityCheck.totalCapacity}).`);
        }
    }

    // 3. Execution
    await prisma.$transaction(async (tx) => {
        const toRemove = Array.from(currentIds).filter(id => !moduleIds.includes(id));
        
        // Remove deselected (only if no grade exists)
        if (toRemove.length > 0) {
            await tx.moduleRegistration.deleteMany({
                where: {
                    student_id: studentId,
                    module_id: { in: toRemove },
                    semester_id: semesterId,
                    grade: { is: null } // Only if not graded
                }
            });
        }

        // Add new
        if (toAdd.length > 0) {
            await tx.moduleRegistration.createMany({
                data: toAdd.map(id => ({
                    student_id: studentId,
                    module_id: id,
                    semester_id: semesterId,
                    status: 'REGISTERED',
                    registration_date: new Date()
                }))
            });
        }
    });

    revalidatePath('/dashboard/student/modules');
    return { success: true };
}

/**
 * Get Enrollment Oversight statistics for staff.
 */
/**
 * @swagger
 * /action/enrollment/getEnrollmentStats:
 *   post:
 *     summary: "[Server Action] Get Enrollment Statistics"
 *     description: Returns department-wide enrollment metrics, including student counts per module and capacity utilization.
 *     tags:
 *       - Staff Actions
 *     responses:
 *       200:
 *         description: Successfully fetched enrollment stats
 */
export async function getEnrollmentStats() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const modules = await prisma.module.findMany({
        where: { active: true },
        include: {
            module_registrations: {
                where: { status: 'REGISTERED' }
            }
        }
    });

    const defaultCapacity = 100;
    return modules.map((m) => {
        const capacity = defaultCapacity;
        const enrolled = m.module_registrations.length;
        return {
            id: m.module_id,
            code: m.code,
            name: m.name,
            enrolled,
            capacity,
            percentage: Math.round((enrolled / capacity) * 100),
        };
    });
}
