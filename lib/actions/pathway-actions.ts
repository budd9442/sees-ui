'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

/**
 * Submit ranked pathway preferences for a student.
 */
export async function submitPathwayPreferences(preferences: {
    preference1: string; // Program ID or Code
    preference2: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // [GOVERNANCE] Check if pathway selection window is open
    const windowSetting = await prisma.systemSetting.findUnique({ where: { key: 'is_pathway_selection_open' } });
    if (windowSetting?.value !== 'true') {
        throw new Error("Pathway selection is currently CLOSED by administration.");
    }

    // 1. Resolve codes to IDs if necessary
    const [p1, p2] = await Promise.all([
        prisma.degreeProgram.findUnique({ where: { code: preferences.preference1 } }),
        prisma.degreeProgram.findUnique({ where: { code: preferences.preference2 } })
    ]);

    if (!p1 || !p2) throw new Error("Invalid degree program selected.");

    // 2. Update student record
    await prisma.student.update({
        where: { student_id: session.user.id },
        data: {
            pathway_preference_1_id: p1.program_id,
            pathway_preference_2_id: p2.program_id,
            pathway_selection_date: new Date()
        }
    });

    revalidatePath('/dashboard/student/pathway');
    return { success: true };
}

/**
 * Get allocation statistics for administrative staff.
 */
export async function getPathwayAllocationStatus() {
    const session = await auth();
    // In a real app, we'd check for STAFF/ADMIN role here
    if (!session?.user?.id) throw new Error("Unauthorized");

    const programs = await prisma.degreeProgram.findMany({
        where: { active: true },
        include: {
            intakes: {
                where: { status: 'OPEN' },
                orderBy: { academic_year: { start_date: 'desc' } },
                take: 1
            }
        }
    });

    const stats = await Promise.all(programs.map(async (prog) => {
        const pref1Count = await prisma.student.count({
            where: { pathway_preference_1_id: prog.program_id }
        });
        const pref2Count = await prisma.student.count({
            where: { pathway_preference_2_id: prog.program_id }
        });

        return {
            programId: prog.program_id,
            code: prog.code,
            name: prog.name,
            pref1Count,
            pref2Count,
            capacity: prog.intakes[0]?.max_students || 60
        };
    }));

    return stats;
}

/**
 * Run the GPA-based allocation engine.
 * This is a highly destructive administrative action.
 */
export async function runPathwayAllocation() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await prisma.$transaction(async (tx) => {
        // 1. Get all L1 students with their preferences and current GPA
        const students = await tx.student.findMany({
            where: { current_level: 'Level 1' },
            orderBy: { current_gpa: 'desc' },
            include: {
                preference_1: true,
                preference_2: true
            }
        });

        // 2. Get program capacities
        const rawPrograms = await tx.degreeProgram.findMany({
            include: {
                intakes: { where: { status: 'OPEN' } }
            }
        });

        const capacities: Record<string, number> = {};
        const currentEnrollment: Record<string, number> = {};

        rawPrograms.forEach(p => {
            capacities[p.program_id] = p.intakes[0]?.max_students || 60;
            currentEnrollment[p.program_id] = 0;
        });

        const updates = [];

        // 3. GPA-Ranked Greedy Allocation
        for (const student of students) {
            let assignedId = null;

            // Try Preference 1
            if (student.pathway_preference_1_id && currentEnrollment[student.pathway_preference_1_id] < capacities[student.pathway_preference_1_id]) {
                assignedId = student.pathway_preference_1_id;
            } 
            // Try Preference 2
            else if (student.pathway_preference_2_id && currentEnrollment[student.pathway_preference_2_id] < capacities[student.pathway_preference_2_id]) {
                assignedId = student.pathway_preference_2_id;
            }
            // Fallback (e.g. to IT which usually has space if MIT is full)
            else {
                const itProg = rawPrograms.find(p => p.code === 'IT');
                if (itProg) assignedId = itProg.program_id;
            }

            if (assignedId) {
                currentEnrollment[assignedId]++;
                updates.push(tx.student.update({
                    where: { student_id: student.student_id },
                    data: {
                        degree_path_id: assignedId,
                        pathway_locked: true
                    }
                }));
            }
        }

        await Promise.all(updates);

        return { 
            success: true, 
            totalProcessed: updates.length,
            distribution: currentEnrollment
        };
    });
}
