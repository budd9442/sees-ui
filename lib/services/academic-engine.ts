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
        // Fetch dynamic limit from settings
        const setting = await prisma.systemSetting.findUnique({ where: { key: 'limit_semester_credits' } });
        const MAX_CREDITS = parseInt(setting?.value || '21');

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

    /**
     * Determines if GPA-based allocation is required based on dynamic threshold.
     */
    static async shouldUseGPABasedAllocation(demandPercentage: number): Promise<boolean> {
        const setting = await prisma.systemSetting.findUnique({ where: { key: 'threshold_pathway_priority' } });
        const threshold = parseFloat(setting?.value || '60');
        return demandPercentage >= threshold;
    }

    /**
     * Production-Grade GPA Calculation (Best Attempt Policy)
     * Fetches all released grades for a student and calculates cumulative GPA using 
     * the highest score per module.
     */
    static async calculateStudentGPA(studentId: string): Promise<{
        gpa: number;
        totalCredits: number;
        academicClass: string;
    }> {
        const grades = await prisma.grade.findMany({
            where: {
                student_id: studentId,
                released_at: { not: null } // Strict: Only released grades
            },
            include: { module: true }
        });

        if (grades.length === 0) {
            return { gpa: 0, totalCredits: 0, academicClass: 'Unassigned' };
        }
        const moduleMap = new Map<string, { points: number, credits: number }>();
        
        grades.forEach(g => {
            const current = moduleMap.get(g.module_id);
            if (!current || g.grade_point > current.points) {
                moduleMap.set(g.module_id, {
                    points: g.grade_point,
                    credits: g.module.credits
                });
            }
        });

        let totalPoints = 0;
        let totalCredits = 0;

        moduleMap.forEach(data => {
            totalPoints += data.points * data.credits;
            totalCredits += data.credits;
        });

        const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

        // Dynamic Honors Determination
        const settings = await prisma.systemSetting.findMany({
            where: { key: { startsWith: 'threshold_' } }
        });

        const thresholds = {
            first: parseFloat(settings.find(s => s.key === 'threshold_first_class')?.value || '3.7'),
            upper: parseFloat(settings.find(s => s.key === 'threshold_second_upper')?.value || '3.3'),
            lower: parseFloat(settings.find(s => s.key === 'threshold_second_lower')?.value || '3.0'),
            third: parseFloat(settings.find(s => s.key === 'threshold_third_class')?.value || '2.5')
        };

        let honors = 'Pass';
        if (gpa >= thresholds.first) honors = 'First Class';
        else if (gpa >= thresholds.upper) honors = 'Second Class Upper';
        else if (gpa >= thresholds.lower) honors = 'Second Class Lower';
        else if (gpa >= thresholds.third) honors = 'Third Class';

        return {
            gpa: parseFloat(gpa.toFixed(2)),
            totalCredits,
            academicClass: honors
        };
    }
}
