import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email/brevo';
import { getBaseEmailLayout } from '@/lib/email/templates';
import type { NotificationEventKeyType } from '@/lib/notifications/events';
import { ensureDefaultNotificationConfig } from '@/lib/notifications/defaults';
import { interpolateTemplate, plainTextToEmailHtml } from '@/lib/notifications/render';

export type DispatchEmailParams = {
    eventKey: NotificationEventKeyType;
    dedupeKey: string;
    to: string;
    toName?: string;
    recipientUserId?: string;
    entityType?: string;
    entityId?: string;
    vars: Record<string, string | number | undefined | null>;
};

export type DispatchResult =
    | { ok: true; skipped: true; reason: string }
    | { ok: true; skipped: false; messageId?: string }
    | { ok: false; error: string };

/**
 * Send a single transactional email using admin template + trigger config.
 * Respects trigger `enabled`, dedupes successful sends via `dedupe_key`.
 */
export async function dispatchNotificationEmail(params: DispatchEmailParams): Promise<DispatchResult> {
    const { eventKey, dedupeKey, to, toName, recipientUserId, entityType, entityId, vars } = params;

    if (!to?.trim()) {
        return { ok: false, error: 'Missing recipient email' };
    }

    await ensureDefaultNotificationConfig();

    const trigger = await prisma.notificationTriggerConfig.findUnique({
        where: { event_key: eventKey },
    });
    if (trigger && !trigger.enabled) {
        return { ok: true, skipped: true, reason: 'trigger_disabled' };
    }

    const existing = await prisma.notificationDispatchLog.findUnique({
        where: { dedupe_key: dedupeKey },
    });
    if (existing?.status === 'SENT') {
        return { ok: true, skipped: true, reason: 'already_sent' };
    }

    const template = await prisma.notificationEmailTemplate.findFirst({
        where: { event_key: eventKey, is_active: true },
        orderBy: { updated_at: 'desc' },
    });
    if (!template) {
        return { ok: false, error: `No active template for ${eventKey}` };
    }

    const subject = interpolateTemplate(template.subject, vars).trim();
    const bodyRaw = interpolateTemplate(template.body, vars);
    const innerHtml = plainTextToEmailHtml(bodyRaw);
    const htmlContent = getBaseEmailLayout(subject || 'Notification', `<div class="email-body">${innerHtml}</div>`);

    try {
        const res = await sendEmail({
            to: to.trim(),
            toName,
            subject: subject || 'Notification',
            htmlContent,
        });
        const messageId =
            res && typeof res === 'object' && 'body' in res && res.body && typeof res.body === 'object' && 'messageId' in res.body
                ? String((res.body as { messageId?: string }).messageId ?? '')
                : undefined;

        await prisma.notificationDispatchLog.upsert({
            where: { dedupe_key: dedupeKey },
            create: {
                dedupe_key: dedupeKey,
                event_key: eventKey,
                recipient_email: to.trim(),
                recipient_user_id: recipientUserId ?? null,
                entity_type: entityType ?? null,
                entity_id: entityId ?? null,
                status: 'SENT',
                error_message: null,
            },
            update: {
                status: 'SENT',
                error_message: null,
                recipient_email: to.trim(),
                recipient_user_id: recipientUserId ?? null,
                entity_type: entityType ?? null,
                entity_id: entityId ?? null,
            },
        });

        return { ok: true, skipped: false, messageId };
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await prisma.notificationDispatchLog.upsert({
            where: { dedupe_key: dedupeKey },
            create: {
                dedupe_key: dedupeKey,
                event_key: eventKey,
                recipient_email: to.trim(),
                recipient_user_id: recipientUserId ?? null,
                entity_type: entityType ?? null,
                entity_id: entityId ?? null,
                status: 'FAILED',
                error_message: msg,
            },
            update: {
                status: 'FAILED',
                error_message: msg,
            },
        });
               return { ok: false, error: msg };
    }
}
