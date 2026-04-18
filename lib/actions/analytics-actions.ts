'use server';

import ExcelJS from 'exceljs';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { executeAnalyticsQuery, type AnalyticsQueryResult } from '@/lib/analytics/execute-analytics-query';
import { reportDefinitionSchema, type ReportDefinition } from '@/lib/analytics/schema';

export async function runAnalyticsQueryAction(input: unknown): Promise<AnalyticsQueryResult> {
    return executeAnalyticsQuery(input);
}

export async function listAnalyticsReports() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    if (!['staff', 'advisor', 'hod', 'admin'].includes(session.user.role)) throw new Error('Unauthorized');

    return prisma.analyticsReport.findMany({
        where: { owner_user_id: session.user.id },
        orderBy: { updated_at: 'desc' },
        select: {
            report_id: true,
            title: true,
            scope_role: true,
            updated_at: true,
        },
    });
}

export async function getAnalyticsReport(reportId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const row = await prisma.analyticsReport.findFirst({
        where: { report_id: reportId, owner_user_id: session.user.id },
    });
    if (!row) throw new Error('Report not found');

    const definition = reportDefinitionSchema.parse(row.definition);
    return { ...row, definition };
}

export async function saveAnalyticsReport(input: {
    reportId?: string;
    title: string;
    definition: ReportDefinition;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    if (!['staff', 'advisor', 'hod', 'admin'].includes(session.user.role)) throw new Error('Unauthorized');

    const definition = reportDefinitionSchema.parse(input.definition);

    if (input.reportId) {
        const updated = await prisma.analyticsReport.updateMany({
            where: { report_id: input.reportId, owner_user_id: session.user.id },
            data: {
                title: input.title,
                definition: definition as object,
            },
        });
        if (updated.count === 0) throw new Error('Report not found');
        return { reportId: input.reportId };
    }

    const created = await prisma.analyticsReport.create({
        data: {
            owner_user_id: session.user.id,
            scope_role: session.user.role,
            title: input.title,
            definition: definition as object,
        },
    });
    return { reportId: created.report_id };
}

export async function duplicateAnalyticsReport(reportId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const row = await prisma.analyticsReport.findFirst({
        where: { report_id: reportId, owner_user_id: session.user.id },
    });
    if (!row) throw new Error('Report not found');

    const definition = reportDefinitionSchema.parse(row.definition);
    const copy = await prisma.analyticsReport.create({
        data: {
            owner_user_id: session.user.id,
            scope_role: session.user.role,
            title: `${row.title} (copy)`,
            definition: definition as object,
        },
    });
    return { reportId: copy.report_id };
}

export async function deleteAnalyticsReport(reportId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const deleted = await prisma.analyticsReport.deleteMany({
        where: { report_id: reportId, owner_user_id: session.user.id },
    });
    if (deleted.count === 0) throw new Error('Report not found');
    return { ok: true };
}

function rowsToCsv(columns: string[], rows: Record<string, unknown>[]) {
    const esc = (v: unknown) => {
        const s = v === null || v === undefined ? '' : String(v);
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
    };
    const header = columns.map(esc).join(',');
    const body = rows.map((r) => columns.map((c) => esc(r[c])).join(',')).join('\n');
    return `${header}\n${body}`;
}

export async function exportAnalyticsCsv(input: unknown): Promise<{ filename: string; csv: string }> {
    const res = await executeAnalyticsQuery(input);
    const csv = rowsToCsv(res.columns, res.rows);
    return { filename: 'analytics-export.csv', csv };
}

export async function exportAnalyticsXlsxBase64(input: unknown): Promise<{ filename: string; base64: string }> {
    const res = await executeAnalyticsQuery(input);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Data');
    ws.addRow(res.columns);
    for (const row of res.rows) {
        ws.addRow(res.columns.map((c) => row[c]));
    }
    const buf = await wb.xlsx.writeBuffer();
    const base64 = Buffer.from(buf).toString('base64');
    return { filename: 'analytics-export.xlsx', base64 };
}
