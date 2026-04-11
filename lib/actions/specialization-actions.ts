'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { GeminiService } from '@/lib/services/gemini-service';
import { revalidatePath } from 'next/cache';

/**
 * Get AI-Generated Specialization Guidance
 */
export async function getSpecializationGuidance() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Only MIT students have these specializations
    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        include: { degree_path: true }
    });

    if (student?.degree_path?.code !== 'MIT') {
        return { 
            isEligible: false, 
            message: "Specialization selection is only available for MIT Students." 
        };
    }

    const advice = await GeminiService.generateSpecializationAdvice(session.user.id);
    return { isEligible: true, ...advice };
}

/**
 * Submit Specialization Selection
 */
export async function submitSpecializationSelection(specializationCode: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const spec = await prisma.specialization.findUnique({
        where: { code: specializationCode }
    });

    if (!spec) throw new Error("Invalid specialization code.");

    await prisma.student.update({
        where: { student_id: session.user.id },
        data: { specialization_id: spec.specialization_id }
    });

    revalidatePath('/dashboard/student/specialization');
    return { success: true };
}

/**
 * Fetch Specialization Status & Meta-data
 */
export async function getSpecializationInitialData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id },
        include: {
            degree_path: {
                include: { specializations: true }
            },
            specialization: true
        }
    });

    if (!student) throw new Error("Student record not found.");

    return {
        currentSpecialization: student.specialization,
        availableSpecializations: student.degree_path.specializations,
        degreeCode: student.degree_path.code,
        isMIT: student.degree_path.code === 'MIT'
    };
}
