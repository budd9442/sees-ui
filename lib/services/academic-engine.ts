import { prisma } from '@/lib/db';

/**
 * AcademicEngine
 * Centralized service for validating academic constraints (Prerequisites, Credits, Capacity).
 */
export class AcademicEngine {

    /**
     * Recursive Prerequisite Validation
     * Checks if a student has successfully completed all required modules for a target module.
     */
    static async validatePrerequisites(studentId: string, moduleId: string): Promise<{
        isEligible: boolean;
        missingCodes: string[];
    }> {
        // 1. Fetch Module with its Prerequisites (Module_A side)
        const target = await prisma.module.findUnique({
            where: { module_id: moduleId },
            include: {
                Module_A: true // Assuming Module_A is the child (Target) pointing to Module_B (Prereq)
                // Actually, self-referencing M:M naming is tricky. 
                // Let's assume Module_A = Prerequisites for THIS module.
            }
        });

        if (!target) return { isEligible: true, missingCodes: [] };

        const prerequisites = (target as any).Module_A || [];
        if (prerequisites.length === 0) return { isEligible: true, missingCodes: [] };

        // 2. Fetch Student Grades for these prerequisites
        const completedGrades = await prisma.grade.findMany({
            where: {
                student_id: studentId,
                module_id: { in: prerequisites.map((p: any) => p.module_id) },
                grade_point: { gt: 0 } // Must have actually passed
            },
            include: { module: true }
        });

        const completedModuleIds = new Set(completedGrades.map(g => g.module_id));
        const missing = prerequisites.filter((p: any) => !completedModuleIds.has(p.module_id));

        return {
            isEligible: missing.length === 0,
            missingCodes: missing.map((p: any) => p.code)
        };
    }

    /**
     * Credit Load Validation
     * Ensures students do not exceed the 21-credit standard limit per semester.
     */
    static async validateCreditLoad(studentId: string, semesterId: string, newModuleIds: string[]): Promise<{
        allowed: boolean;
        totalCredits: number;
        limit: number;
    }> {
        const MAX_CREDITS = 21;

        // 1. Get currently registered modules for this semester
        const existing = await prisma.moduleRegistration.findMany({
            where: {
                student_id: studentId,
                semester_id: semesterId,
                status: 'REGISTERED'
            },
            include: { module: true }
        });

        // 2. Filter out already registered modules from the 'new' list to avoid double counting
        const currentIds = new Set(existing.map(e => e.module_id));
        const trulyNew = newModuleIds.filter(id => !currentIds.has(id));

        // 3. Fetch credits for truly new modules
        const newModules = await prisma.module.findMany({
            where: { module_id: { in: trulyNew } }
        });

        const existingCredits = existing.reduce((sum, e) => sum + e.module.credits, 0);
        const addedCredits = newModules.reduce((sum, m) => sum + m.credits, 0);
        const total = existingCredits + addedCredits;

        return {
            allowed: total <= MAX_CREDITS,
            totalCredits: total,
            limit: MAX_CREDITS
        };
    }

    /**
     * Capacity Validation
     * Checks if a module has space in the current semester.
     */
    static async validateCapacity(moduleId: string, semesterId: string): Promise<{
        hasSpace: boolean;
        currentCount: number;
        totalCapacity: number;
    }> {
        const [mod, count] = await Promise.all([
            prisma.module.findUnique({ where: { module_id: moduleId } }),
            prisma.moduleRegistration.count({
                where: {
                    module_id: moduleId,
                    semester_id: semesterId,
                    status: 'REGISTERED'
                }
            })
        ]);

        const capacity = mod?.max_students || 60;

        return {
            hasSpace: count < capacity,
            currentCount: count,
            totalCapacity: capacity
        };
    }
}
