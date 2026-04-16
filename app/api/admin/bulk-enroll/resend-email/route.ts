import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { generateTempPassword } from '@/lib/email/templates';
import { dispatchNotificationEmail } from '@/lib/notifications/dispatch';
import { NotificationEventKey } from '@/lib/notifications/events';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as any).email?.includes('admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { recordId } = await req.json();

        if (!recordId) {
            return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
        }

        // Fetch the record
        const record = await prisma.bulkEnrollmentRecord.findUnique({
            where: { record_id: recordId }
        });

        if (!record) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        if (record.status !== 'SUCCESS') {
            return NextResponse.json(
                { error: 'Can only resend emails for successful enrollments' },
                { status: 400 }
            );
        }

        if (!record.user_id) {
            return NextResponse.json(
                { error: 'No user associated with this record' },
                { status: 400 }
            );
        }

        // Fetch the user
        const user = await prisma.user.findUnique({
            where: { user_id: record.user_id }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate new temporary password
        const tempPassword = generateTempPassword();
        const passwordHash = await hash(tempPassword, 10);

        // Update user password
        await prisma.user.update({
            where: { user_id: user.user_id },
            data: { password_hash: passwordHash }
        });

        // Send registration email (new dedupe per resend so repeat sends are not blocked)
        try {
            const loginBase = process.env.NEXT_PUBLIC_APP_URL || 'https://sees.budd.codes';
            const loginUrl = `${loginBase.replace(/\/$/, '')}/login`;
            const dispatch = await dispatchNotificationEmail({
                eventKey: NotificationEventKey.ENROLLMENT_WELCOME,
                dedupeKey: `${NotificationEventKey.ENROLLMENT_WELCOME}:resend:${recordId}:${Date.now()}`,
                to: record.email,
                toName: `${record.firstName} ${record.lastName}`.trim(),
                recipientUserId: user.user_id,
                entityType: 'bulk_enrollment_record',
                entityId: recordId,
                vars: {
                    firstName: record.firstName,
                    username: user.username,
                    tempPassword,
                    loginUrl,
                },
            });

            if (!dispatch.ok) {
                throw new Error('error' in dispatch ? dispatch.error : 'Send failed');
            }
            if ('skipped' in dispatch && dispatch.skipped) {
                throw new Error(dispatch.reason === 'trigger_disabled' ? 'Welcome emails are disabled in admin notification settings' : 'Email was skipped');
            }

            // Update record with resend information
            await prisma.bulkEnrollmentRecord.update({
                where: { record_id: recordId },
                data: {
                    email_resend_count: { increment: 1 },
                    last_email_sent_at: new Date()
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Registration email resent successfully'
            });
        } catch (emailError) {
            console.error('Failed to resend email:', emailError);
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Resend email error:', error);
        return NextResponse.json(
            { error: 'Failed to resend registration email' },
            { status: 500 }
        );
    }
}
