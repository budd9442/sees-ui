'use server';

import { auth } from '@/auth';
import { GPAMonitoringService } from '@/lib/services/gpa-monitoring';
import { GeminiService } from '@/lib/services/gemini-service';
import { prisma } from '@/lib/db';

/**
 * Get Student Academic Risk Status & AI Recovery Advice
 */
export async function getAcademicRecoveryData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const studentId = session.user.id;

    // Detect Trajectory Dip
    const trend = await GPAMonitoringService.getStudentGPAGraph(studentId);

    if (!trend.dipDetected) {
        return { dipDetected: false, trend };
    }

    // Get AI Recovery Advice
    const advice = await GeminiService.generateAcademicRecoveryAdvice(studentId, trend.dipAmount);

    // Get Advisor Info for direct link
    const student = await prisma.student.findUnique({
        where: { student_id: studentId },
        include: { 
            advisor: { 
                include: { staff: { include: { user: true } } }
            }
        }
    });

    let activeAdvisor = student?.advisor?.staff?.user;

    // Fallback logic: If no specific advisor assigned, pick the first available one from the system
    if (!activeAdvisor) {
        const fallbackAdvisorRecord = await prisma.advisor.findFirst({
            where: { is_available_for_contact: true },
            include: {
                staff: {
                    include: {
                        user: true
                    }
                }
            }
        });
        activeAdvisor = fallbackAdvisorRecord?.staff?.user;
    }

    return {
        dipDetected: true,
        trend,
        advice,
        advisor: activeAdvisor
    };
}
