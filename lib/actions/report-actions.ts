'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function submitAnonymousReport(data: {
    subject: string;
    categoryId: string;
    content: string;
    priority: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // Get student record
    const student = await prisma.student.findUnique({
        where: { student_id: session.user.id }
    });
    if (!student) throw new Error('Student record not found');

    const report = await prisma.anonymousReport.create({
        data: {
            report_id: randomUUID(),
            student_id: student.student_id,
            subject: data.subject,
            category_id: data.categoryId,
            content: data.content,
            priority: data.priority,
            status: 'PENDING'
        }
    });

    revalidatePath('/dashboard/student/reports');
    return { success: true, id: report.report_id };
}

export async function getStudentReportsData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const reports = await prisma.anonymousReport.findMany({
        where: { student_id: session.user.id },
        include: { category: true },
        orderBy: { created_at: 'desc' }
    });

    return {
        reports: reports.map(r => ({
            id: r.report_id,
            subject: r.subject,
            category: r.category?.name || 'Uncategorized',
            status: r.status,
            createdAt: r.created_at.toISOString()
        }))
    };
}

export async function getReportCategories() {
    return prisma.reportCategory.findMany({
        where: { is_active: true },
        select: { id: true, name: true }
    });
}
