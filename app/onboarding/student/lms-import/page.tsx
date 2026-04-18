export const dynamic = "force-dynamic";
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import LmsImportClient from './lms-import-client';

export default async function LmsImportPage() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'student') {
        redirect('/login');
    }

    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id as string },
        select: { onboarding_completed_at: true, metadata: true },
    });

    if (!student) {
        redirect('/login');
    }

    // Don’t allow LMS import before onboarding.
    if (!student.onboarding_completed_at) {
        redirect('/onboarding/student');
    }

    const metadata = (student.metadata ?? {}) as any;
    const lmsCompletedAt =
        metadata?.lms_import_completed_at ??
        metadata?.lmsImportCompletedAt ??
        (metadata?.lms_import_completed ? new Date().toISOString() : null);

    const lmsSkippedAt =
        metadata?.lms_import_skipped_at ??
        metadata?.lmsImportSkippedAt ??
        (metadata?.lms_import_skipped ? new Date().toISOString() : null);

    if (lmsCompletedAt || lmsSkippedAt) {
        redirect('/dashboard/student');
    }

    return <LmsImportClient />;
}

