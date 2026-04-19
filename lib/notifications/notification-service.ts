import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email/brevo';
import { NotificationEventKeyType } from './events';

/**
 * Interface for basic notification data
 */
interface NotifyParams {
    userId: string;
    eventKey: NotificationEventKeyType;
    title: string;
    content: string;
    // Data for template placeholders in email
    data?: Record<string, string>;
    // Optional dedupe key for idempotent sending (e.g. "grade-release-studentId-moduleId")
    dedupeKey?: string;
}

/**
 * Dispatches a notification to a user.
 * Always creates an in-app notification record.
 * Optionally sends an email if the trigger is enabled and a template exists.
 */
export async function notifyUser({
    userId,
    eventKey,
    title,
    content,
    data = {},
    dedupeKey
}: NotifyParams) {
    try {
        // 1. Check for deduplication if key is provided
        if (dedupeKey) {
            const existing = await prisma.notificationDispatchLog.findUnique({
                where: { dedupe_key: dedupeKey }
            });
            if (existing) {
                console.log(`[NOTIFY] Deduplication hit for key: ${dedupeKey}. Skipping.`);
                return { success: true, skipped: true, reason: 'DEDUPLICATED' };
            }
        }

        // 2. Always create in-app notification record
        await prisma.notification.create({
            data: {
                user_id: userId,
                type: eventKey,
                title,
                content: content,
                sent_at: new Date(),
            }
        });

        // 3. Check if email trigger is enabled
        const trigger = await prisma.notificationTriggerConfig.findUnique({
            where: { event_key: eventKey }
        });

        // Default to enabled if not found yet (bootstrap behavior)
        const isEnabled = trigger ? trigger.enabled : true;

        if (isEnabled) {
            // Fetch active email template for this event
            const template = await prisma.notificationEmailTemplate.findFirst({
                where: { event_key: eventKey, is_active: true },
                orderBy: { updated_at: 'desc' }
            });

            if (template) {
                const user = await prisma.user.findUnique({
                    where: { user_id: userId },
                    select: { email: true, firstName: true, lastName: true }
                });

                if (user?.email) {
                    const parsedSubject = replacePlaceholders(template.subject, data);
                    const parsedBody = replacePlaceholders(template.body, data);

                    // Send email via Brevo
                    await sendEmail({
                        to: user.email,
                        toName: `${user.firstName} ${user.lastName}`,
                        subject: parsedSubject,
                        htmlContent: `
                            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                                ${parsedBody.replace(/\n/g, '<br/>')}
                            </div>
                        `
                    }, {
                        actorUserId: 'SYSTEM',
                        action: `SEND_NOTIF_${eventKey}`,
                        entityType: 'NOTIFICATION',
                        entityId: eventKey,
                    });

                    // Log successful dispatch
                    if (dedupeKey) {
                        await prisma.notificationDispatchLog.create({
                            data: {
                                dedupe_key: dedupeKey,
                                event_key: eventKey,
                                recipient_email: user.email,
                                recipient_user_id: userId,
                                status: 'SENT'
                            }
                        });
                    }
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error(`[NOTIFY] Error dispatching notification ${eventKey} to user ${userId}:`, error);
        return { success: false, error };
    }
}

/**
 * Simple helper to replace {{mustache}} style placeholders
 */
function replacePlaceholders(text: string, data: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}
