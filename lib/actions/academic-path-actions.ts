'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

/**
 * Fetch available specialized paths for the current student
 */
export async function getAvailableSpecializedPaths() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        include: { degree_path: true }
    });

    if (!student) throw new Error("Student profile not found");

    // Fetch transitions for the student's current program and potential next level (L2)
    const transitions = await prisma.academicPathTransition.findMany({
        where: {
            source_program_id: student.degree_path_id,
            level: 'L2' // As per requirement: Year 2 selection
        },
        include: {
            target_program: true
        }
    });

    return transitions.map(t => t.target_program);
}

/**
 * Finalize specialized path selection
 */
export async function selectSpecializedPath(targetProgramId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id }
    });

    if (!student) throw new Error("Student profile not found");

    // Perform the update
    await prisma.student.update({
        where: { student_id: session.user.id },
        data: {
            degree_path_id: targetProgramId,
            pathway_locked: true, // Lock the selection for production readiness
            pathway_selection_date: new Date()
        }
    });

    revalidatePath('/dashboard/student');
    revalidatePath('/dashboard/student/pathway');
    
    return { success: true };
}
