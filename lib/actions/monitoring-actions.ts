'use server';

import { auth } from '@/auth';
import { GPAMonitoringService } from '@/lib/services/gpa-monitoring';
import { AIService } from '@/lib/services/ai-service';
import { prisma } from '@/lib/db';

/**
 * Get Student Academic Risk Status & AI Recovery Advice.
 *
 * Dip detection: compares only the two most recent cumulative GPA datapoints
 * (latest-1 vs latest). If a dip of >= 0.2 is detected, AI advice is fetched
 * once and cached per unique (previousGPA, currentGPA) pair.
 * Subsequent loads return the cached advice without calling the AI API again.
 */
/**
 * @swagger
 * /action/monitoring/getAcademicRecoveryData:
 *   post:
 *     summary: "[Server Action] Get GPA Recovery Advice"
 *     description: Detects GPA dips and returns AI-generated recovery plans and advisor contact information.
 *     tags:
 *       - Monitoring Actions
 *     responses:
 *       200:
 *         description: Successfully fetched recovery data
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
        advice = await AIService.generateAcademicRecoveryAdvice(studentId, trend.dipAmount);

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

/**
 * Force-regenerate AI advice for the current GPA dip.
 * Deletes the existing cached snapshot and triggers a fresh generation.
 */
export async function regenerateAcademicRecoveryPlan() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const studentId = session.user.id;

    // We need to know the fingerprint to delete the correct one
    const trend = await GPAMonitoringService.getStudentGPAGraph(studentId);
    if (!trend.dipDetected) return { dipDetected: false, trend };

    const dipFingerprint = `${trend.previousGPA.toFixed(2)}_${trend.currentGPA.toFixed(2)}`;

    // Delete the existing snapshot
    await (prisma as any).academicRecoverySnapshot.deleteMany({
        where: { student_id: studentId, dip_fingerprint: dipFingerprint }
    });

    // Re-fetch (which will trigger fresh generation)
    return getAcademicRecoveryData();
}
