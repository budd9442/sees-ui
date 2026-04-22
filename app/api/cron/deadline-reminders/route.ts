import { NextResponse } from 'next/server';
import { processDeadlineReminders } from '@/lib/notifications/deadline-reminders';

/**
 * @swagger
 * /api/cron/deadline-reminders:
 *   get:
 *     summary: Send deadline reminders (Cron)
 *     description: Background task to send reminder emails for upcoming deadlines. Requires CRON_SECRET authorization.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reminders processed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
    const secret = process.env.CRON_SECRET;
    const auth = req.headers.get('authorization');
    if (!secret || auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const summary = await processDeadlineReminders();
        return NextResponse.json(summary);
    } catch (e) {
        console.error('processDeadlineReminders', e);
        return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
    }
}
