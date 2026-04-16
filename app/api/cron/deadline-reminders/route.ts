import { NextResponse } from 'next/server';
import { processDeadlineReminders } from '@/lib/notifications/deadline-reminders';

/**
 * Daily cron: send deadline reminder emails for open module-registration and selection rounds.
 * Configure your scheduler to GET this URL with header `Authorization: Bearer <CRON_SECRET>`.
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
