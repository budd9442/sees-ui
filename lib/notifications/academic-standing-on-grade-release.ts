import { prisma } from '@/lib/db';
import { AcademicEngine } from '@/lib/services/academic-engine';
import { dispatchNotificationEmail } from '@/lib/notifications/dispatch';
import { NotificationEventKey } from '@/lib/notifications/events';

export type StandingSnapshot = { gpa: number; academicClass: string };

/** Snapshot GPA / academic standing using only grades already released in the DB. */
export async function captureStandingBeforeRelease(studentIds: string[]): Promise<Map<string, StandingSnapshot>> {
    const map = new Map<string, StandingSnapshot>();
    for (const sid of [...new Set(studentIds)]) {
        const r = await AcademicEngine.calculateStudentGPA(sid);
        map.set(sid, { gpa: r.gpa, academicClass: r.academicClass });
    }
    return map;
}

/**
 * After new grades are released, notify students whose GPA-based academic standing changed
 * (e.g. Second Upper → First Class). Uses `evaluateStudentEligibility` via `AcademicEngine.calculateStudentGPA`.
 */
export async function notifyAcademicStandingChangesAfterGradeRelease(
    affectedStudentIds: string[],
    beforeByStudent: Map<string, StandingSnapshot>,
    releaseBatchId: number
): Promise<void> {
    for (const sid of new Set(affectedStudentIds)) {
        const before = beforeByStudent.get(sid);
        if (!before) continue;

        const after = await AcademicEngine.calculateStudentGPA(sid);
        if (before.academicClass === after.academicClass) continue;

        const user = await prisma.user.findUnique({
            where: { user_id: sid },
            select: { email: true, firstName: true, lastName: true },
        });
        if (!user?.email) continue;

        const studentName = `${user.firstName} ${user.lastName}`.trim();
        await dispatchNotificationEmail({
            eventKey: NotificationEventKey.ACADEMIC_STANDING_CHANGED,
            dedupeKey: `${NotificationEventKey.ACADEMIC_STANDING_CHANGED}:${sid}:${releaseBatchId}`,
            to: user.email,
            toName: studentName,
            recipientUserId: sid,
            entityType: 'academic_standing',
            entityId: String(releaseBatchId),
            vars: {
                studentName,
                previousAcademicStanding: before.academicClass,
                newAcademicStanding: after.academicClass,
                currentGpa: Number.isFinite(after.gpa) ? after.gpa.toFixed(2) : String(after.gpa),
            },
        });
    }
}
