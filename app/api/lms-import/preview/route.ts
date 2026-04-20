import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { pushToQueue } from '@/lib/queue/queue-service';

export const dynamic = 'force-dynamic';

const QUEUE_NAME = 'lms_import';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json().catch(() => null);
        const username = body?.username;
        const password = body?.password;

        if (!username || typeof username !== 'string' || username.trim().length < 1) {
            return NextResponse.json({ error: 'LMS username is required' }, { status: 400 });
        }
        if (!password || typeof password !== 'string' || password.trim().length < 1) {
            return NextResponse.json({ error: 'LMS password is required' }, { status: 400 });
        }

        const studentId = session.user.id as string;

        const dbUser = await prisma.user.findUnique({
            where: { user_id: studentId },
            select: { student: { select: { onboarding_completed_at: true } } },
        });

        if (!dbUser?.student?.onboarding_completed_at) {
            return NextResponse.json({ error: 'Onboarding not completed' }, { status: 400 });
        }

        const lmsUsername = username.trim();

        const importSession = await prisma.lmsImportSession.create({
            data: {
                student_id: studentId,
                status: 'RUNNING',
                stage: 'LOGIN',
                progress_pct: 0,
            },
        });

        console.log(`[API] Enqueuing LMS import job for session ${importSession.session_id}, student ${studentId}`);
        const enqueued = await pushToQueue(QUEUE_NAME, {
            session_id: importSession.session_id,
            student_id: studentId,
            lms_username: lmsUsername,
            lms_password: password,
            // Never log sensitive fields.
        });

        if (!enqueued) {
            console.error(`[API] Failed to enqueue LMS import job for session ${importSession.session_id}`);
            await prisma.lmsImportSession.update({
                where: { session_id: importSession.session_id },
                data: { status: 'FAILED', stage: 'READY', progress_pct: 0, error_message: 'Failed to enqueue job' },
            });
            return NextResponse.json({ error: 'Failed to start import' }, { status: 500 });
        }

        return NextResponse.json({ sessionId: importSession.session_id });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Failed to start LMS import' }, { status: 500 });
    }
}

