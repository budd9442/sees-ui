'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { isWithinRegistrationWindow, SELECTION_ROUND_WINDOW_COPY } from '@/lib/registration-time-window';

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

    // Window follows HOD-managed selection rounds (OPEN + dates), not feature flags
    let closingDate: Date | null = null;
    let isWindowOpen = false;
    if (student.current_level) {
        const openRound = await prisma.selectionRound.findFirst({
            where: {
                type: 'PATHWAY',
                status: 'OPEN',
                level: student.current_level,
            },
            orderBy: { created_at: 'desc' },
        });
        if (openRound) {
            closingDate = openRound.closes_at;
            const w = isWithinRegistrationWindow(
                openRound.opens_at,
                openRound.closes_at,
                new Date(),
                SELECTION_ROUND_WINDOW_COPY
            );
            isWindowOpen = w.ok;
        }
    }

    // 2. Identify Academic Year
    const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
    if (!activeYear) throw new Error("No active academic year found");

    // 3. Identify the "Source" program (the general one)
    // If they already chose one (locked), we find the transition source
    let sourceProgramId = student.degree_path_id;
    if (student.pathway_locked && isWindowOpen) {
        const transition = await prisma.academicPathTransition.findFirst({
            where: { target_program_id: student.degree_path_id }
        });
        if (transition) sourceProgramId = transition.source_program_id;
    }

    // 4. Calculate Batch Quota (60% of students in the same starting program/admission year)
    const cohortSize = await prisma.student.count({
        where: { 
            degree_path_id: sourceProgramId,
            admission_year: student.admission_year
        }
    });
    const quota = Math.max(1, Math.round(cohortSize * 0.6));

    const transitions = await prisma.academicPathTransition.findMany({
        where: {
            source_program_id: sourceProgramId,
            level: 'L2'
        },
        include: {
            target_program: true
        }
    });

    // 5. Hydrate each path with Rank, Status, and Demand
    const enrichedPaths = await Promise.all(transitions.map(async (t) => {
        const targetId = t.target_program_id;
        
        // Get all students who picked this as Preference 1
        const applicants = await prisma.student.findMany({
            where: { pathway_preference_1_id: targetId },
            orderBy: [
                { current_gpa: 'desc' },
                { pathway_selection_date: 'asc' }
            ],
            select: { student_id: true, current_gpa: true }
        });

        const applicantCount = applicants.length;
        const isGpaPriority = applicantCount > quota;
        const studentRank = applicants.findIndex(a => a.student_id === student.student_id) + 1;
        
        let status: 'PROVISIONAL' | 'WAITLISTED' | 'NOT_SELECTED' = 'NOT_SELECTED';
        if (student.pathway_preference_1_id === targetId) {
            status = studentRank <= quota ? 'PROVISIONAL' : 'WAITLISTED';
        }

        return {
            ...t.target_program,
            selectionStats: {
                applicantCount,
                quota,
                mode: isGpaPriority ? 'GPA_PRIORITY' : 'FREE',
                rank: studentRank > 0 ? studentRank : null,
                status,
                cutoffGpa: applicants[quota - 1]?.current_gpa || 0,
                demandPercentage: Math.min(Math.round((applicantCount / quota) * 100), 100)
            }
        };
    }));

    return {
        status: isWindowOpen ? 'AVAILABLE' as const : 'COMPLETED' as const,
        paths: enrichedPaths,
        currentSelectionId: student.pathway_preference_1_id || student.degree_path_id,
        isLocked: student.pathway_locked,
        closingDate,
        batchSize: cohortSize,
        batchQuota: quota
    };
}

/**
 * Finalize specialized path selection (Preference only until deadline)
 */
export async function selectSpecializedPath(targetProgramId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id }
    });

    if (!student) throw new Error("Student profile not found");

    // Perform the update - strictly as Preference 1
    await prisma.student.update({
        where: { student_id: session.user.id },
        data: {
            pathway_preference_1_id: targetProgramId,
            pathway_selection_date: new Date()
        }
    });

    revalidatePath('/dashboard/student');
    revalidatePath('/dashboard/student/pathway');
    
    return { success: true };
}
