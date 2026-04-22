'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

/**
 * @swagger
 * /action/report/submitAnonymousReport:
 *   post:
 *     summary: "[Server Action] Submit Anonymous Report"
 *     description: Submits a student grievance or report anonymously, notifies the responsible department, and creates a tracking record.
 *     tags:
 *       - Report Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               content:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully submitted report
 */
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

    const category = await prisma.reportCategory.findUnique({
        where: { id: data.categoryId }
    });

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

    // Trigger notification for new report submission
    try {
        const { dispatchNotificationEmail } = await import('@/lib/notifications/dispatch');
        const { NotificationEventKey } = await import('@/lib/notifications/events');

        // Determine recipient (category owner or fallback to an admin-level notification)
        // For now, if category has an assigned_to, use that, otherwise we could notify all admins
        // But dispatchNotificationEmail handles one recipient. 
        // We'll notify the category assigned_to if it exists.
        if (category?.assigned_to) {
             await dispatchNotificationEmail({
                eventKey: NotificationEventKey.REPORT_SUBMITTED,
                dedupeKey: `report-sub-${report.report_id}`,
                to: category.assigned_to, // This might be an email or ID, we assume email for simple dispatch
                entityType: 'ANONYMOUS_REPORT',
                entityId: report.report_id,
                vars: {
                    reportTitle: report.subject || 'No Subject',
                    reportCategory: category.name,
                    reportPriority: report.priority,
                }
            });
        }
    } catch (e) {
        console.error('Failed to dispatch report submission notification:', e);
    }

    revalidatePath('/dashboard/student/reports');
    return { success: true, id: report.report_id };
}

/**
 * @swagger
 * /action/report/getStudentReportsData:
 *   post:
 *     summary: "[Server Action] List Student Reports"
 *     description: Returns a history of reports and grievances submitted by the currently authenticated student.
 *     tags:
 *       - Report Actions
 *     responses:
 *       200:
 *         description: Successfully fetched reports
 */
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

/**
 * @swagger
 * /action/report/getReportCategories:
 *   post:
 *     summary: "[Server Action] List Report Categories"
 *     description: Returns available categories for anonymous reporting (e.g., academic, facilities, harassment).
 *     tags:
 *       - Report Actions
 */
export async function getReportCategories() {
    return prisma.reportCategory.findMany({
        where: { is_active: true },
        select: { id: true, name: true }
    });
}
