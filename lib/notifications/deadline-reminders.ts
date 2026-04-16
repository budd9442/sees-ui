import { prisma } from '@/lib/db';
import { differenceInCalendarDays, format, startOfDay } from 'date-fns';
import { dispatchNotificationEmail } from '@/lib/notifications/dispatch';
import { NotificationEventKey } from '@/lib/notifications/events';
import { ensureDefaultNotificationConfig } from '@/lib/notifications/defaults';

export type DeadlineReminderSummary = {
    emailsAttempted: number;
    emailsSent: number;
    skippedTriggers: boolean;
};

/**
 * Sends deadline reminder emails for OPEN module-registration and selection rounds
 * when today's calendar distance to `closes_at` matches configured `daysBeforeClose`
 * (stored on `NotificationTriggerConfig` for `DEADLINE_REMINDER`).
 *
 * Intended to be run daily via cron (`/api/cron/deadline-reminders`).
 */
export async function processDeadlineReminders(now: Date = new Date()): Promise<DeadlineReminderSummary> {
    await ensureDefaultNotificationConfig();

    const trigger = await prisma.notificationTriggerConfig.findUnique({
        where: { event_key: NotificationEventKey.DEADLINE_REMINDER },
    });

    if (!trigger?.enabled) {
        return { emailsAttempted: 0, emailsSent: 0, skippedTriggers: true };
    }

    const config = (trigger.config_json as { daysBeforeClose?: number[] } | null) || {};
    const daysList =
        Array.isArray(config.daysBeforeClose) && config.daysBeforeClose.length > 0 ? config.daysBeforeClose : [1, 3];

    let emailsAttempted = 0;
    let emailsSent = 0;

    const moduleRounds = await prisma.moduleRegistrationRound.findMany({
        where: { status: 'OPEN', closes_at: { not: null } },
        include: { academic_year: { select: { label: true } } },
    });

    for (const round of moduleRounds) {
        const close = round.closes_at as Date;
        const diff = differenceInCalendarDays(startOfDay(close), startOfDay(now));
        if (!daysList.includes(diff)) continue;

        const students = await prisma.student.findMany({
            where: {
                enrollment_status: 'ENROLLED',
                ...(round.levels?.length ? { current_level: { in: round.levels } } : {}),
            },
            include: { user: true },
        });

        const deadlineTitle = `Module registration: ${round.label}`;
        const deadlineDate = format(close, 'PPpp');
        const extraMessage = [round.student_message, round.academic_year?.label ? `Academic year: ${round.academic_year.label}` : '']
            .filter(Boolean)
            .join('\n');

        for (const s of students) {
            const u = s.user;
            if (!u?.email) continue;
            const studentName = `${u.firstName} ${u.lastName}`.trim();
            const dedupe = `DEADLINE_REMINDER:module_reg:${round.round_id}:${s.student_id}:${close.toISOString()}:d${diff}`;

            emailsAttempted++;
            const r = await dispatchNotificationEmail({
                eventKey: NotificationEventKey.DEADLINE_REMINDER,
                dedupeKey: dedupe,
                to: u.email,
                toName: studentName,
                recipientUserId: s.student_id,
                entityType: 'module_registration_round',
                entityId: round.round_id,
                vars: {
                    studentName,
                    deadlineTitle,
                    deadlineDate,
                    extraMessage,
                },
            });
            if (r.ok && !('skipped' in r && r.skipped)) emailsSent++;
        }
    }

    const selectionRounds = await prisma.selectionRound.findMany({
        where: { status: 'OPEN', closes_at: { not: null } },
    });

    for (const round of selectionRounds) {
        const close = round.closes_at as Date;
        const diff = differenceInCalendarDays(startOfDay(close), startOfDay(now));
        if (!daysList.includes(diff)) continue;

        const students = await prisma.student.findMany({
            where: {
                enrollment_status: 'ENROLLED',
                current_level: round.level,
            },
            include: { user: true },
        });

        const deadlineTitle = `${round.type} selection: ${round.label}`;
        const deadlineDate = format(close, 'PPpp');
        const extraMessage = `Level: ${round.level}`;

        for (const s of students) {
            const u = s.user;
            if (!u?.email) continue;
            const studentName = `${u.firstName} ${u.lastName}`.trim();
            const dedupe = `DEADLINE_REMINDER:selection:${round.round_id}:${s.student_id}:${close.toISOString()}:d${diff}`;

            emailsAttempted++;
            const r = await dispatchNotificationEmail({
                eventKey: NotificationEventKey.DEADLINE_REMINDER,
                dedupeKey: dedupe,
                to: u.email,
                toName: studentName,
                recipientUserId: s.student_id,
                entityType: 'selection_round',
                entityId: round.round_id,
                vars: {
                    studentName,
                    deadlineTitle,
                    deadlineDate,
                    extraMessage,
                },
            });
            if (r.ok && !('skipped' in r && r.skipped)) emailsSent++;
        }
    }

    return { emailsAttempted, emailsSent, skippedTriggers: false };
}
