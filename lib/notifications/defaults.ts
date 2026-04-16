import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { ALL_NOTIFICATION_EVENT_KEYS, NotificationEventKey } from '@/lib/notifications/events';

type DefaultTpl = {
    name: string;
    event_key: string;
    subject: string;
    body: string;
    placeholders: string[];
};

const DEFAULT_TEMPLATES: DefaultTpl[] = [
    {
        name: 'Grade released',
        event_key: NotificationEventKey.GRADE_RELEASED,
        subject: 'Your grades for {{moduleName}} are now available',
        body: 'Dear {{studentName}},\n\nYour grades for {{moduleCode}} — {{moduleName}} have been released. Letter grade: {{letterGrade}}.\n\nLog in to SEES to view details.\n\n— Academic Team',
        placeholders: ['{{studentName}}', '{{moduleName}}', '{{moduleCode}}', '{{letterGrade}}'],
    },
    {
        name: 'Academic level changed',
        event_key: NotificationEventKey.ACADEMIC_CLASS_CHANGED,
        subject: 'Your academic level has been updated',
        body: 'Dear {{studentName}},\n\nYour academic level has changed from {{previousLevel}} to {{newLevel}}.\n\nIf you have questions, contact your advisor.\n\n— Academic Team',
        placeholders: ['{{studentName}}', '{{previousLevel}}', '{{newLevel}}'],
    },
    {
        name: 'Academic standing changed (GPA)',
        event_key: NotificationEventKey.ACADEMIC_STANDING_CHANGED,
        subject: 'Your academic standing has been updated',
        body: 'Dear {{studentName}},\n\nFollowing newly released grades, your cumulative GPA is now {{currentGpa}} and your academic standing is {{newAcademicStanding}} (previously {{previousAcademicStanding}}).\n\n— Academic Team',
        placeholders: ['{{studentName}}', '{{previousAcademicStanding}}', '{{newAcademicStanding}}', '{{currentGpa}}'],
    },
    {
        name: 'Welcome — new student account',
        event_key: NotificationEventKey.ENROLLMENT_WELCOME,
        subject: 'Welcome to SEES — your account details',
        body: 'Hello {{firstName}},\n\nYour account has been created.\n\nUsername: {{username}}\nTemporary password: {{tempPassword}}\n\nPlease log in at {{loginUrl}} and change your password.\n\n— SEES',
        placeholders: ['{{firstName}}', '{{username}}', '{{tempPassword}}', '{{loginUrl}}'],
    },
    {
        name: 'Deadline reminder',
        event_key: NotificationEventKey.DEADLINE_REMINDER,
        subject: 'Reminder: {{deadlineTitle}} closes {{deadlineDate}}',
        body: 'Dear {{studentName}},\n\nThis is a reminder about: {{deadlineTitle}}.\n\nClosing: {{deadlineDate}}.\n\n{{extraMessage}}\n\n— SEES',
        placeholders: ['{{studentName}}', '{{deadlineTitle}}', '{{deadlineDate}}', '{{extraMessage}}'],
    },
    {
        name: 'Module registration window opened',
        event_key: NotificationEventKey.MODULE_REGISTRATION_OPENED,
        subject: 'Module registration is open: {{windowLabel}}',
        body: 'Dear {{studentName}},\n\nThe module registration window "{{windowLabel}}" is now open. Please complete any changes before {{closesAt}}.\n\n{{extraMessage}}\n\n— SEES',
        placeholders: ['{{studentName}}', '{{windowLabel}}', '{{closesAt}}', '{{extraMessage}}'],
    },
    {
        name: 'Pathway selection opened',
        event_key: NotificationEventKey.PATHWAY_SELECTION_OPENED,
        subject: 'Pathway selection is open: {{windowLabel}}',
        body: 'Dear {{studentName}},\n\nPathway selection "{{windowLabel}}" for {{level}} is now open. Submit your preferences before {{closesAt}}.\n\n{{extraMessage}}\n\n— Academic Team',
        placeholders: ['{{studentName}}', '{{windowLabel}}', '{{level}}', '{{closesAt}}', '{{extraMessage}}'],
    },
    {
        name: 'Specialization selection opened',
        event_key: NotificationEventKey.SPECIALIZATION_SELECTION_OPENED,
        subject: 'Specialization selection is open: {{windowLabel}}',
        body: 'Dear {{studentName}},\n\nSpecialization selection "{{windowLabel}}" for {{level}} is now open. Submit your preferences before {{closesAt}}.\n\n{{extraMessage}}\n\n— Academic Team',
        placeholders: ['{{studentName}}', '{{windowLabel}}', '{{level}}', '{{closesAt}}', '{{extraMessage}}'],
    },
    {
        name: 'Pathway / allocation outcome',
        event_key: NotificationEventKey.PATHWAY_ALLOCATED,
        subject: 'Your pathway allocation update',
        body: 'Dear {{studentName}},\n\nYour academic pathway allocation has been updated.\n\nOutcome: {{outcome}}\n\n— Academic Team',
        placeholders: ['{{studentName}}', '{{outcome}}'],
    },
    {
        name: 'System alert',
        event_key: NotificationEventKey.SYSTEM_ALERT,
        subject: '{{alertTitle}}',
        body: '{{alertBody}}',
        placeholders: ['{{alertTitle}}', '{{alertBody}}'],
    },
];

const DEFAULT_DEADLINE_CONFIG = { daysBeforeClose: [1, 3] as number[] };

/**
 * Ensures trigger rows and at least one active template per event exist.
 * Safe to call on each admin page load (idempotent).
 */
export async function ensureDefaultNotificationConfig(): Promise<void> {
    await prisma.$transaction(async (tx) => {
        for (const key of ALL_NOTIFICATION_EVENT_KEYS) {
            const existingTrigger = await tx.notificationTriggerConfig.findUnique({
                where: { event_key: key },
            });
            if (!existingTrigger) {
                await tx.notificationTriggerConfig.create({
                    data: {
                        config_id: randomUUID(),
                        event_key: key,
                        enabled: true,
                        config_json:
                            key === NotificationEventKey.DEADLINE_REMINDER
                                ? (DEFAULT_DEADLINE_CONFIG as object)
                                : undefined,
                    },
                });
            }
        }

        for (const def of DEFAULT_TEMPLATES) {
            const existing = await tx.notificationEmailTemplate.findFirst({
                where: { event_key: def.event_key, is_active: true },
            });
            if (!existing) {
                await tx.notificationEmailTemplate.create({
                    data: {
                        template_id: randomUUID(),
                        name: def.name,
                        event_key: def.event_key,
                        subject: def.subject,
                        body: def.body,
                        placeholders: def.placeholders,
                        is_active: true,
                        channel: 'email',
                    },
                });
            }
        }
    });
}
