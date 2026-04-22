import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/lms-import/skip:
 *   post:
 *     summary: Skip LMS import
 *     description: Marks the LMS import as skipped for the student.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully skipped import
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentId = session.user.id as string;

        const student = await prisma.student.findUnique({
            where: { student_id: studentId },
            select: { onboarding_completed_at: true, metadata: true },
        });

        if (!student?.onboarding_completed_at) {
            return NextResponse.json({ error: 'Onboarding not completed' }, { status: 400 });
        }

        const nextMetadata = {
            ...((student.metadata ?? {}) as any),
            lms_import_skipped_at: new Date().toISOString(),
            lms_import_skipped: true,
        };

        await prisma.student.update({
            where: { student_id: studentId },
            data: { metadata: nextMetadata },
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Failed to skip LMS import' }, { status: 500 });
    }
}

