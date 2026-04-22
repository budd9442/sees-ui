import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/lms-import/session/{id}:
 *   get:
 *     summary: Get LMS import session status
 *     description: Returns the status and preview data of an LMS import session.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched session status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const studentId = session.user.id as string;

    const importSession = await prisma.lmsImportSession.findUnique({
        where: { session_id: id },
        select: { session_id: true, student_id: true, status: true, stage: true, progress_pct: true, preview_json: true, error_message: true },
    });

    if (!importSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (importSession.student_id !== studentId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const preview = importSession.preview_json ?? (importSession.error_message ? { error_message: importSession.error_message } : null);

    return NextResponse.json({
        sessionId: importSession.session_id,
        status: importSession.status,
        stage: importSession.stage,
        progress_pct: importSession.progress_pct,
        preview,
    });
}

