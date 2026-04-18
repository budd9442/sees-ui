'use server';

import { auth } from '@/auth';
import { GPAMonitoringService } from '@/lib/services/gpa-monitoring';
import { GrokService } from '@/lib/services/grok-service';
import { prisma } from '@/lib/db';

/**
 * Get Student Academic Risk Status & AI Recovery Advice.
 *
 * Dip detection: compares only the two most recent cumulative GPA datapoints
 * (latest-1 vs latest). If a dip of >= 0.2 is detected, AI advice is fetched
 * once and cached per unique (previousGPA, currentGPA) pair.
 * Subsequent loads return the cached advice without calling the AI API again.
 */
export async function getAcademicRecoveryData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const studentId = session.user.id;

    // Detect Trajectory Dip (compares latest-1 GPA with latest GPA)
    const trend = await GPAMonitoringService.getStudentGPAGraph(studentId);

    if (!trend.dipDetected) {
        return { dipDetected: false, trend };
    }

    // Build a unique fingerprint for this specific dip event
    const dipFingerprint = `${trend.previousGPA.toFixed(2)}_${trend.currentGPA.toFixed(2)}`;

    // Check for a cached AI advice snapshot for this exact dip
    const existing = await (prisma as any).academicRecoverySnapshot.findUnique({
        where: { student_id_dip_fingerprint: { student_id: studentId, dip_fingerprint: dipFingerprint } }
    });

    let advice: any;
    if (existing) {
        // Use cached advice — no AI call needed
        advice = existing.advice_json;
    } else {
        // Generate fresh AI advice and persist it
        advice = await GrokService.generateAcademicRecoveryAdvice(studentId, trend.dipAmount);

        await (prisma as any).academicRecoverySnapshot.create({
            data: {
                student_id: studentId,
                dip_fingerprint: dipFingerprint,
                previous_gpa: trend.previousGPA,
                current_gpa: trend.currentGPA,
                advice_json: advice,
            }
        });
    }

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

    // Fallback: if no specific advisor assigned, pick the first available from the system pool
    if (!activeAdvisor) {
        const fallbackAdvisorRecord = await (prisma as any).advisor.findFirst({
            where: { is_available_for_contact: true },
            include: { staff: { include: { user: true } } }
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
