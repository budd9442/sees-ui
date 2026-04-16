import { format } from 'date-fns';
import { prisma } from '@/lib/db';
import { studentMatchesRoundLevels } from '@/lib/module-registration-round-utils';
import { dispatchNotificationEmail } from '@/lib/notifications/dispatch';
import { NotificationEventKey } from '@/lib/notifications/events';

/**
 * Notify eligible students immediately when a module registration round is opened (HOD/admin).
 */
export async function notifyModuleRegistrationWindowOpened(roundId: string): Promise<void> {
    const openBatchId = Date.now();
    const round = await prisma.moduleRegistrationRound.findUnique({
        where: { round_id: roundId },
        include: { academic_year: { select: { label: true } } },
    });
    if (!round || round.status !== 'OPEN') return;

    const students = await prisma.student.findMany({
        where: { enrollment_status: 'ENROLLED' },
        include: { user: true },
    });

    const levelsLine = round.levels?.length ? round.levels.join(', ') : 'all study levels';
    const closesAt = round.closes_at ? format(round.closes_at, 'PPpp') : '—';
    const extraMessage = [
        round.student_message,
        round.academic_year?.label ? `Academic year: ${round.academic_year.label}` : null,
        `Levels: ${levelsLine}`,
    ]
        .filter(Boolean)
        .join('\n');

    const windowLabel = round.label;

    for (const s of students) {
        if (!studentMatchesRoundLevels(round.levels, s.current_level)) continue;
        const u = s.user;
        if (!u?.email) continue;
        const studentName = `${u.firstName} ${u.lastName}`.trim();
        await dispatchNotificationEmail({
            eventKey: NotificationEventKey.MODULE_REGISTRATION_OPENED,
            dedupeKey: `${NotificationEventKey.MODULE_REGISTRATION_OPENED}:${roundId}:${s.student_id}:${openBatchId}`,
            to: u.email,
            toName: studentName,
            recipientUserId: s.student_id,
            entityType: 'module_registration_round',
            entityId: roundId,
            vars: {
                studentName,
                windowLabel,
                closesAt,
                extraMessage,
            },
        });
    }
}

/**
 * Notify eligible students when a pathway or specialization selection round is opened (HOD/admin).
 */
export async function notifySelectionRoundWindowOpened(roundId: string): Promise<void> {
    const openBatchId = Date.now();
    const round = await prisma.selectionRound.findUnique({
        where: { round_id: roundId },
        include: { academic_year: { select: { label: true } } },
    });
    if (!round || round.status !== 'OPEN') return;

    const type = String(round.type ?? '').toUpperCase();
    const eventKey =
        type === 'SPECIALIZATION'
            ? NotificationEventKey.SPECIALIZATION_SELECTION_OPENED
            : NotificationEventKey.PATHWAY_SELECTION_OPENED;

    const students = await prisma.student.findMany({
        where: {
            enrollment_status: 'ENROLLED',
            current_level: round.level,
        },
        include: { user: true },
    });

    const closesAt = round.closes_at ? format(round.closes_at, 'PPpp') : '—';
    const windowLabel = round.label;
    const extraMessage = [
        round.academic_year?.label ? `Academic year: ${round.academic_year.label}` : null,
        round.notes ? `Note: ${round.notes}` : null,
    ]
        .filter(Boolean)
        .join('\n');

    for (const s of students) {
        const u = s.user;
        if (!u?.email) continue;
        const studentName = `${u.firstName} ${u.lastName}`.trim();
        await dispatchNotificationEmail({
            eventKey,
            dedupeKey: `${eventKey}:${roundId}:${s.student_id}:${openBatchId}`,
            to: u.email,
            toName: studentName,
            recipientUserId: s.student_id,
            entityType: 'selection_round',
            entityId: roundId,
            vars: {
                studentName,
                windowLabel,
                level: round.level,
                closesAt,
                extraMessage,
            },
        });
    }
}
