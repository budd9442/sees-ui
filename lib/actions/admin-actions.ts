'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { ensureDefaultGradingSchemeInDb } from '@/lib/grading/module-bands';
import { DEFAULT_INSTITUTION_GRADING_BANDS, validateBands } from '@/lib/grading/marks-to-grade';
import { ensureDefaultNotificationConfig } from '@/lib/notifications/defaults';
import { categoryToEventKey, eventKeyToCategory } from '@/lib/notifications/category-map';
import { interpolateTemplate, plainTextToEmailHtml } from '@/lib/notifications/render';
import { getBaseEmailLayout } from '@/lib/email/templates';
import type { NotificationTemplate } from '@/types';
import { writeAuditLog } from '@/lib/audit/write-audit-log';
import {
    getBackupsList,
    getAdminBackupsData as backup_getAdminBackupsData,
    createAdminBackup as backup_createAdminBackup,
    deleteAdminBackup as backup_deleteAdminBackup,
    restoreAdminBackup as backup_restoreAdminBackup,
    downloadBackupAsBase64 as backup_downloadBackupAsBase64,
} from '@/lib/actions/backup-actions';

/** Audit rows + notification dispatch log, sorted for admin monitoring / logs UI. */
async function buildUnifiedLogsForAdmin() {
    const [dbLogs, dispatchLogs] = await Promise.all([
        prisma.auditLog.findMany({ take: 400, orderBy: { timestamp: 'desc' } }),
        prisma.notificationDispatchLog.findMany({ take: 400, orderBy: { created_at: 'desc' } }),
    ]);

    const actorIds = [...new Set(dbLogs.map((l) => l.admin_id).filter((id): id is string => !!id))];
    const users =
        actorIds.length > 0
            ? await prisma.user.findMany({
                  where: { user_id: { in: actorIds } },
                  select: { user_id: true, email: true },
              })
            : [];
    const emailByUserId = Object.fromEntries(users.map((u) => [u.user_id, u.email]));

    const auditMapped = dbLogs.map((l) => {
        const meta = (l.metadata ?? null) as Record<string, unknown> | null;
        const actorEmail = l.admin_id ? emailByUserId[l.admin_id] ?? l.admin_id : null;
        const displayEmail = actorEmail ?? (meta?.email as string | undefined) ?? '';
        const isError = l.action === 'AUTH_LOGIN_FAILED';
        return {
            id: l.log_id,
            timestamp: l.timestamp.toISOString(),
            level: isError ? 'ERROR' : 'INFO',
            status: isError ? 'failed' : 'info',
            source: l.category ?? 'AUDIT',
            message: `${l.action} — ${l.entity_type}`,
            details: `${l.action} on ${l.entity_type} (${l.entity_id})`,
            userEmail: displayEmail || '—',
            userId: l.admin_id ?? '',
            action: l.action,
            resource: l.entity_type,
            metadata: {
                ...(meta && typeof meta === 'object' ? meta : {}),
                entity_id: l.entity_id,
                entity_type: l.entity_type,
                category: l.category,
                ip_address: l.ip_address,
                user_agent: l.user_agent,
            },
        };
    });

    const dispatchMapped = dispatchLogs.map((d) => ({
        id: `ndl-${d.log_id}`,
        timestamp: d.created_at.toISOString(),
        level: d.status === 'FAILED' ? 'ERROR' : 'INFO',
        status: d.status === 'FAILED' ? 'failed' : 'success',
        source: 'NOTIFICATION_DISPATCH',
        message: `Email ${d.event_key} → ${d.recipient_email}`,
        details: d.error_message ?? `Dispatch ${d.status}`,
        userEmail: d.recipient_email,
        userId: d.recipient_user_id ?? '',
        action: 'email_dispatch',
        resource: d.event_key,
        metadata: {
            event_key: d.event_key,
            entity_type: d.entity_type,
            entity_id: d.entity_id,
            category: 'EMAIL',
        },
    }));

    return [...auditMapped, ...dispatchMapped]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 500);
}

function formatDatabaseSize(bytes: bigint | number): string {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n < 0) return '—';
    const gb = n / (1024 ** 3);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = n / (1024 ** 2);
    return `${mb.toFixed(1)} MB`;
}

export async function getAdminDashboardData() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    let userId = session.user.id;

    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!u && session.user.email) {
        u = await prisma.user.findUnique({ where: { email: session.user.email } });
    }

    if (!u) throw new Error("Admin unauthenticated");
    userId = u.user_id;

    const userRecord = await prisma.user.findUnique({
        where: { user_id: userId }
    }) as any;

    if (!userRecord || userRecord.role !== 'admin') {
        return null;
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    const prismaAny = prisma as any;
    const [
        totalUsers,
        activeSessions,
        adminCount,
        studentCount,
        staffCount,
        latestMetric,
        metricSeries,
        failedDispatches24h,
        dispatches24h,
        failedLogins24h,
        dispatches1h,
        runningImports,
        importFailed24h,
        importReady24h,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
            where: { last_login_date: { gte: twentyFourHoursAgo } },
        }),
        prisma.user.count({ where: { role: 'admin' } }),
        prisma.student.count(),
        prisma.staff.count(),
        prisma.systemMetric.findFirst({ orderBy: { timestamp: 'desc' } }),
        prisma.systemMetric.findMany({
            orderBy: { timestamp: 'desc' },
            take: 120,
            select: { timestamp: true, active_users: true, health: true, cpu: true, memory: true },
        }),
        prisma.notificationDispatchLog.count({
            where: { status: 'FAILED', created_at: { gte: twentyFourHoursAgo } },
        }),
        prisma.notificationDispatchLog.count({
            where: { created_at: { gte: twentyFourHoursAgo } },
        }),
        prisma.auditLog.count({
            where: { action: 'AUTH_LOGIN_FAILED', timestamp: { gte: twentyFourHoursAgo } },
        }),
        prisma.notificationDispatchLog.count({
            where: { created_at: { gte: oneHourAgo } },
        }),
        prismaAny.lmsImportSession.count({
            where: { status: 'RUNNING', updated_at: { gte: fifteenMinutesAgo } },
        }),
        prismaAny.lmsImportSession.count({
            where: { status: 'FAILED', updated_at: { gte: twentyFourHoursAgo } },
        }),
        prismaAny.lmsImportSession.count({
            where: { status: 'PREVIEW_READY', updated_at: { gte: twentyFourHoursAgo } },
        }),
    ]);

    const roleDistribution = [
        { name: 'Students', value: studentCount, color: '#3b82f6' },
        { name: 'Staff', value: staffCount, color: '#10b981' },
        { name: 'Admins', value: adminCount, color: '#ef4444' },
    ];

    let databaseSize = '—';
    try {
        const rows = await prisma.$queryRaw<{ size: bigint }[]>(
            Prisma.sql`SELECT pg_database_size(current_database()) AS size`
        );
        if (rows[0]?.size != null) databaseSize = formatDatabaseSize(rows[0].size);
    } catch {
        if (latestMetric) {
            databaseSize = `${latestMetric.storage_used.toFixed(1)} / ${latestMetric.storage_total.toFixed(1)} GB (host disk)`;
        }
    }

    let dbConnections: number | null = null;
    let dbConnectionsMax: number | null = null;
    try {
        const conn = await prisma.$queryRaw<{ c: bigint }[]>(
            Prisma.sql`SELECT count(*)::bigint AS c FROM pg_stat_activity WHERE datname = current_database()`
        );
        if (conn[0]?.c != null) dbConnections = Number(conn[0].c);
        const maxRow = await prisma.$queryRaw<{ s: string }[]>(
            Prisma.sql`SELECT setting AS s FROM pg_settings WHERE name = 'max_connections'`
        );
        if (maxRow[0]?.s) dbConnectionsMax = parseInt(maxRow[0].s, 10) || 100;
    } catch {
        /* keep nulls */
    }

    let lastBackupLabel = 'None yet';
    try {
        const backups = await getBackupsList();
        if (backups.length > 0) {
            lastBackupLabel = new Date(backups[0].createdAt).toLocaleString();
        }
    } catch {
        /* ignore */
    }

    const healthScore = latestMetric?.health ?? 0;
    let serverStatusLabel = 'Unknown';
    if (latestMetric) {
        if (healthScore >= 80) serverStatusLabel = 'Healthy';
        else if (healthScore >= 50) serverStatusLabel = 'Degraded';
        else serverStatusLabel = 'Critical';
    }

    const maxConn = dbConnectionsMax && dbConnectionsMax > 0 ? dbConnectionsMax : 100;
    const connProgress =
        dbConnections != null ? Math.min(100, Math.round((dbConnections / maxConn) * 100)) : 0;

    const chronological = [...metricSeries].reverse();
    const performanceData =
        chronological.length > 0
            ? chronological.map((m) => ({
                  time: m.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
                  activeUsers: m.active_users,
                  healthScore: m.health,
              }))
            : latestMetric
              ? [
                    {
                        time: latestMetric.timestamp.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        activeUsers: latestMetric.active_users,
                        healthScore: latestMetric.health,
                    },
                ]
              : [];

    const unified = await buildUnifiedLogsForAdmin();
    const recentLogs = unified.slice(0, 10).map((l) => ({
        id: l.id,
        level: l.level,
        message: l.message,
        time: new Date(l.timestamp).toLocaleTimeString(),
        source: l.source,
    }));

    const systemErrors = failedDispatches24h + failedLogins24h;
    const emailFailureRate = dispatches24h > 0 ? failedDispatches24h / dispatches24h : 0;
    const emailServiceStatus =
        dispatches24h === 0
            ? 'Idle'
            : emailFailureRate > 0.2
              ? 'Degraded'
              : 'Healthy';
    const importServiceStatus =
        runningImports > 0
            ? 'Processing'
            : importFailed24h > importReady24h && importFailed24h > 0
              ? 'Degraded'
              : importReady24h > 0
                ? 'Healthy'
                : 'Idle';

    return {
        admin: {
            firstName: userRecord.firstName,
            lastName: userRecord.lastName,
        },
        totalUsers,
        activeSessions,
        systemErrors,
        databaseSize,
        roleDistribution,
        systemMetrics: {
            cpuUsage: latestMetric?.cpu ?? 0,
            memoryUsage: latestMetric?.memory ?? 0,
            dbConnections,
            dbConnectionsMax: maxConn,
            connProgress,
            uptime: latestMetric ? `${latestMetric.uptime.toFixed(1)}%` : '0%',
            lastBackup: lastBackupLabel,
            healthScore,
            serverStatusLabel,
            serviceStatus: {
                email: {
                    status: emailServiceStatus,
                    dispatches1h,
                    dispatches24h,
                    failed24h: failedDispatches24h,
                    successRate:
                        dispatches24h > 0
                            ? `${(((dispatches24h - failedDispatches24h) / dispatches24h) * 100).toFixed(1)}%`
                            : '—',
                },
                import: {
                    status: importServiceStatus,
                    running: runningImports,
                    ready24h: importReady24h,
                    failed24h: importFailed24h,
                },
            },
        },
        performanceData,
        recentLogs,
    };
}

// ----------------------------------------------------------------------
// SYSTEM MONITORING ACTIONS
// ----------------------------------------------------------------------

async function requireAdminUser() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");
    let u = session.user.id
        ? await prisma.user.findUnique({ where: { user_id: session.user.id } })
        : null;
    if (!u && session.user.email) {
        u = await prisma.user.findUnique({ where: { email: session.user.email } });
    }
    if (!u) throw new Error("Unauthorized");
    if (u.role !== 'admin') throw new Error("Access Denied: Not a System Admin");
    return u;
}

export async function getSystemMonitoringData() {
    await requireAdminUser();

    const latestMetrics = await prisma.systemMetric.findFirst({
        orderBy: { timestamp: 'desc' },
    });

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [dispatchTotal, dispatchFailed, auditEvents24h, failedLogins24h] = await Promise.all([
        prisma.notificationDispatchLog.count({
            where: { created_at: { gte: twentyFourHoursAgo } },
        }),
        prisma.notificationDispatchLog.count({
            where: { created_at: { gte: twentyFourHoursAgo }, status: 'FAILED' },
        }),
        prisma.auditLog.count({ where: { timestamp: { gte: twentyFourHoursAgo } } }),
        prisma.auditLog.count({
            where: { timestamp: { gte: twentyFourHoursAgo }, action: 'AUTH_LOGIN_FAILED' },
        }),
    ]);

    let dbConn: number | null = null;
    try {
        const conn = await prisma.$queryRaw<{ c: bigint }[]>(
            Prisma.sql`SELECT count(*)::bigint AS c FROM pg_stat_activity WHERE datname = current_database()`
        );
        if (conn[0]?.c != null) dbConn = Number(conn[0].c);
    } catch {
        /* non-postgres or insufficient privilege */
    }

    const dispatchErrorPct =
        dispatchTotal > 0
            ? ((dispatchFailed / dispatchTotal) * 100).toFixed(1) + '%'
            : '0%';
    const emailOkRate =
        dispatchTotal > 0
            ? (((dispatchTotal - dispatchFailed) / dispatchTotal) * 100).toFixed(1) + '%'
            : '—';

    const cpuPct = latestMetrics ? `${latestMetrics.cpu}%` : '0%';
    const memPct = latestMetrics ? `${latestMetrics.memory}%` : '0%';
    const diskPct = latestMetrics ? `${latestMetrics.storage_percent}%` : '0%';

    const metricsData = {
        uptime: latestMetrics ? `${latestMetrics.uptime.toFixed(1)}%` : '—',
        healthScore: latestMetrics?.health ?? 0,
        activeUsers: latestMetrics?.active_users ?? 0,
        errorRate: dispatchErrorPct,
        failedLoginCount: failedLogins24h,
        cpuUsage: cpuPct,
        memoryUsage: memPct,
        diskUsage: diskPct,
        databaseConnections: dbConn,
        emailDispatchSuccessRate: emailOkRate,
        emailDispatches24h: dispatchTotal,
        auditEvents24h: auditEvents24h,
    };

    const alerts: any[] = [];
    const logs = await buildUnifiedLogsForAdmin();

    const dbSettings = await prisma.systemSetting.findMany();
    const systemConfigs = dbSettings.map((s) => ({
        id: s.setting_id,
        category: s.category,
        key: s.key,
        value: s.value,
        description: s.description || 'System configuration',
        isActive: true,
        version: 1,
        lastModified: s.updated_at.toISOString(),
        modifiedBy: 'System',
    }));

    return {
        metrics: metricsData,
        alerts,
        logs,
        configs: systemConfigs,
    };
}

// Alias for compatibility with logs view
export async function getAdminLogsData() {
    const data = await getSystemMonitoringData();
    return { logs: data.logs };
}

// ----------------------------------------------------------------------
// SYSTEM BACKUP ACTIONS (canonical: backup-actions.ts)
// ----------------------------------------------------------------------

export async function getAdminBackupsData() {
    return backup_getAdminBackupsData();
}

export async function createAdminBackup() {
    return backup_createAdminBackup();
}

export async function deleteAdminBackup(backupId: string) {
    return backup_deleteAdminBackup(backupId);
}

export async function restoreAdminBackup(backupId: string) {
    return backup_restoreAdminBackup(backupId);
}

export async function downloadBackupAsBase64(filename: string) {
    return backup_downloadBackupAsBase64(filename);
}

// ----------------------------------------------------------------------
// NOTIFICATION ENGINE ACTIONS
// ----------------------------------------------------------------------

async function requireAdminForNotifications() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
        throw new Error('Unauthorized');
    }
    return session;
}

export async function getAdminNotificationsData() {
    await requireAdminForNotifications();
    await ensureDefaultNotificationConfig();

    const templates = await prisma.notificationEmailTemplate.findMany({
        orderBy: { updated_at: 'desc' },
    });
    const triggers = await prisma.notificationTriggerConfig.findMany({
        orderBy: { event_key: 'asc' },
    });

    return {
        templates: templates.map((t) => ({
            id: t.template_id,
            name: t.name,
            category: eventKeyToCategory(t.event_key),
            eventKey: t.event_key,
            subject: t.subject,
            body: t.body,
            placeholders: (t.placeholders as string[] | null) ?? [],
            isActive: t.is_active,
            createdAt: t.created_at.toISOString(),
            updatedAt: t.updated_at.toISOString(),
        })),
        triggers: triggers.map((tr) => ({
            eventKey: tr.event_key,
            enabled: tr.enabled,
            configJson: tr.config_json as { daysBeforeClose?: number[] } | null,
        })),
    };
}

export async function createAdminNotificationTemplate(data: Partial<NotificationTemplate> & { category: NotificationTemplate['category'] }) {
    const session = await requireAdminForNotifications();
    if (!data.name?.trim() || !data.subject?.trim() || !data.body?.trim() || !data.category) {
        throw new Error('Name, category, subject, and body are required');
    }

    const event_key = categoryToEventKey(data.category);
    const created = await prisma.notificationEmailTemplate.create({
        data: {
            template_id: randomUUID(),
            name: data.name.trim(),
            event_key,
            subject: data.subject.trim(),
            body: data.body.trim(),
            placeholders: data.placeholders ?? [],
            is_active: data.isActive !== false,
            channel: 'email',
        },
    });

    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_NOTIFICATION_TEMPLATE_CREATE',
        entityType: 'NOTIFICATION_TEMPLATE',
        entityId: created.template_id,
        category: 'ADMIN',
        metadata: { event_key: created.event_key, name: created.name },
    });

    revalidatePath('/dashboard/admin/config/notifications');
    return {
        success: true,
        data: {
            id: created.template_id,
            name: created.name,
            category: data.category,
            eventKey: created.event_key,
            subject: created.subject,
            body: created.body,
            placeholders: (created.placeholders as string[]) ?? [],
            isActive: created.is_active,
            createdAt: created.created_at.toISOString(),
            updatedAt: created.updated_at.toISOString(),
        },
    };
}

export async function updateAdminNotificationTemplate(id: string, data: Partial<NotificationTemplate>) {
    const session = await requireAdminForNotifications();
    const existing = await prisma.notificationEmailTemplate.findUnique({
        where: { template_id: id },
    });
    if (!existing) throw new Error('Template not found');

    const event_key = data.category ? categoryToEventKey(data.category) : existing.event_key;

    const updated = await prisma.notificationEmailTemplate.update({
        where: { template_id: id },
        data: {
            ...(data.name !== undefined ? { name: data.name.trim() } : {}),
            ...(data.subject !== undefined ? { subject: data.subject.trim() } : {}),
            ...(data.body !== undefined ? { body: data.body.trim() } : {}),
            ...(data.placeholders !== undefined ? { placeholders: data.placeholders } : {}),
            ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
            ...(data.category !== undefined ? { event_key } : {}),
        },
    });

    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_NOTIFICATION_TEMPLATE_UPDATE',
        entityType: 'NOTIFICATION_TEMPLATE',
        entityId: updated.template_id,
        category: 'ADMIN',
        metadata: { event_key: updated.event_key },
    });

    revalidatePath('/dashboard/admin/config/notifications');
    return {
        success: true,
        data: {
            id: updated.template_id,
            name: updated.name,
            category: eventKeyToCategory(updated.event_key),
            eventKey: updated.event_key,
            subject: updated.subject,
            body: updated.body,
            placeholders: (updated.placeholders as string[]) ?? [],
            isActive: updated.is_active,
            createdAt: updated.created_at.toISOString(),
            updatedAt: updated.updated_at.toISOString(),
        },
    };
}

export async function deleteAdminNotificationTemplate(id: string) {
    const session = await requireAdminForNotifications();
    await prisma.notificationEmailTemplate.delete({
        where: { template_id: id },
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_NOTIFICATION_TEMPLATE_DELETE',
        entityType: 'NOTIFICATION_TEMPLATE',
        entityId: id,
        category: 'ADMIN',
    });
    revalidatePath('/dashboard/admin/config/notifications');
    return { success: true };
}

export async function updateNotificationTriggerEnabled(eventKey: string, enabled: boolean) {
    const session = await requireAdminForNotifications();
    await prisma.notificationTriggerConfig.update({
        where: { event_key: eventKey },
        data: { enabled },
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_NOTIFICATION_TRIGGER_TOGGLE',
        entityType: 'NOTIFICATION_TRIGGER',
        entityId: eventKey,
        category: 'ADMIN',
        metadata: { enabled },
    });
    revalidatePath('/dashboard/admin/config/notifications');
    return { success: true as const };
}

export async function updateDeadlineReminderConfig(daysBeforeClose: number[]) {
    const session = await requireAdminForNotifications();
    const clean = [...new Set(daysBeforeClose.map((n) => Math.floor(Number(n))).filter((n) => n >= 0 && n <= 30))].sort(
        (a, b) => a - b
    );
    if (clean.length === 0) {
        throw new Error('At least one reminder day is required');
    }
    await prisma.notificationTriggerConfig.update({
        where: { event_key: 'DEADLINE_REMINDER' },
        data: { config_json: { daysBeforeClose: clean } },
    });
    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_DEADLINE_REMINDER_CONFIG',
        entityType: 'NOTIFICATION_TRIGGER',
        entityId: 'DEADLINE_REMINDER',
        category: 'ADMIN',
        metadata: { daysBeforeClose: clean },
    });
    revalidatePath('/dashboard/admin/config/notifications');
    return { success: true as const, daysBeforeClose: clean };
}

function sampleVarsForEventKey(eventKey: string): Record<string, string> {
    const common = {
        studentName: 'Jane Student',
        firstName: 'Jane',
        lastName: 'Student',
        moduleName: 'Data Structures',
        moduleCode: 'CS201',
        letterGrade: 'A-',
        previousLevel: 'Level 1',
        newLevel: 'Level 2',
        username: 'jane.student',
        tempPassword: 'TempP@ss123',
        loginUrl: 'https://sees.budd.codes/login',
        setupLink: 'https://sees.budd.codes/register?token=sample',
        deadlineTitle: 'Module registration window',
        deadlineDate: new Date().toISOString(),
        extraMessage: 'Please complete registration before the deadline.',
        outcome: 'Allocated to BSc Computer Science',
        alertTitle: 'Maintenance',
        alertBody: 'The system will be unavailable tonight.',
        windowLabel: 'Example registration window',
        closesAt: new Date().toISOString(),
        level: 'L2',
        previousAcademicStanding: 'Second Upper',
        newAcademicStanding: 'First Class',
        currentGpa: '3.72',
    };
    return common;
}

export async function previewAdminNotificationTemplate(templateId: string) {
    await requireAdminForNotifications();
    const t = await prisma.notificationEmailTemplate.findUnique({
        where: { template_id: templateId },
    });
    if (!t) throw new Error('Template not found');

    const vars = sampleVarsForEventKey(t.event_key);
    const subject = interpolateTemplate(t.subject, vars);
    const body = interpolateTemplate(t.body, vars);
    const innerHtml = plainTextToEmailHtml(body);
    const html = getBaseEmailLayout(subject || 'Preview', `<div class="email-body">${innerHtml}</div>`);

    return { success: true as const, subject, body, html };
}

// ANONYMOUS REPORTS ACTIONS

export async function getAnonymousReportsData() {
    const session = await auth();
    const allowedRoles = ['admin', 'hod', 'staff', 'advisor'];
    if (!session?.user?.id || !allowedRoles.includes(session.user.role || '')) {
        throw new Error('Unauthorized');
    }

    const userRole = session.user.role;
    const userId = session.user.id;

    // Filtering logic:
    // Admin and HOD see all reports.
    // Staff and Advisor see only reports assigned to them.
    const where: Prisma.AnonymousReportWhereInput = {};
    if (userRole === 'staff' || userRole === 'advisor') {
        where.assigned_to = userId;
    }

    const reports = await prisma.anonymousReport.findMany({
        where,
        include: {
            student: {
                include: { user: true }
            },
            category: true
        },
        orderBy: { created_at: 'desc' }
    });

    const mappedReports = reports.map((r) => ({
        id: r.report_id,
        studentId: 'anonymous',
        category: r.category?.name || 'Uncategorized',
        categoryId: r.category_id,
        title: r.subject || (r.content.substring(0, 50) + (r.content.length > 50 ? '...' : '')),
        description: r.content,
        attachments: [],
        status: anonymousReportStatusToUi(r.status),
        submittedAt: r.created_at.toISOString(),
        consentToContact: false,
        priority: r.priority.toLowerCase(),
        assignedTo: r.assigned_to ?? r.category?.assigned_to ?? '',
        responseNotes: r.admin_notes ?? '',
        reviewedAt: r.updated_at?.toISOString?.() ?? r.created_at.toISOString(),
    }));

    const categories = await prisma.reportCategory.findMany({
        where: { is_active: true }
    });

    const recipients = await prisma.user.findMany({
        where: {
            OR: [
                { role: 'admin' },
                { staff: { isNot: null } }
            ]
        },
        orderBy: { firstName: 'asc' }
    });

    return { 
        reports: mappedReports,
        categories: categories.map(c => ({ id: c.id, name: c.name, assignedTo: c.assigned_to })),
        staffMembers: recipients.map(u => ({
            id: u.user_id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email
        }))
    };
}




export async function getAdminReportCategoriesData() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') throw new Error('Unauthorized');

    const categories = await prisma.reportCategory.findMany({
        orderBy: { name: 'asc' }
    });

    const recipients = await prisma.user.findMany({
        where: {
            OR: [
                { role: 'admin' },
                { staff: { isNot: null } }
            ]
        },
        orderBy: { firstName: 'asc' }
    });

    return {
        categories: categories.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description || '',
            assignedTo: c.assigned_to || '',
            isActive: c.is_active,
            updatedAt: c.updated_at.toISOString()
        })),
        staffMembers: recipients.map(u => ({
            id: u.user_id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email
        }))
    };
}



export async function upsertReportCategory(data: {
    id?: string;
    name: string;
    description?: string;
    assignedTo?: string;
    isActive?: boolean;
}) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') throw new Error('Unauthorized');

    const categoryData: any = {
        name: data.name,
        description: data.description,
        assigned_to: data.assignedTo || null,
        is_active: data.isActive ?? true,
    };

    let result;
    if (data.id) {
        result = await prisma.reportCategory.update({
            where: { id: data.id },
            data: categoryData
        });
    } else {
        result = await prisma.reportCategory.create({
            data: {
                ...categoryData,
                id: randomUUID()
            }
        });
    }

    await writeAuditLog({
        adminId: session.user.id,
        action: data.id ? 'ADMIN_REPORT_CATEGORY_UPDATE' : 'ADMIN_REPORT_CATEGORY_CREATE',
        entityType: 'REPORT_CATEGORY',
        entityId: result.id,
        category: 'ADMIN',
        metadata: { name: result.name }
    });

    revalidatePath('/dashboard/admin/config/reports');
    return { success: true, data: result };
}

export async function deleteReportCategory(id: string) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') throw new Error('Unauthorized');

    // Check if category in use
    const inUse = await prisma.anonymousReport.count({ where: { category_id: id } });
    if (inUse > 0) {
        throw new Error('Category is in use and cannot be deleted. Disable it instead.');
    }

    await prisma.reportCategory.delete({ where: { id } });

    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_REPORT_CATEGORY_DELETE',
        entityType: 'REPORT_CATEGORY',
        entityId: id,
        category: 'ADMIN'
    });

    revalidatePath('/dashboard/admin/config/reports');
    return { success: true };
}


/** Map DB status tokens to reports-review UI filter values. */
function anonymousReportStatusToUi(db: string): string {
    switch (db.toUpperCase()) {
        case 'PENDING':
            return 'submitted';
        case 'IN_REVIEW':
        case 'REVIEWING':
            return 'in_review';
        case 'IN_PROGRESS':
            return 'in_progress';
        case 'RESOLVED':
            return 'resolved';
        case 'CLOSED':
        case 'DISMISSED':
            return 'closed';
        default:
            return db.toLowerCase();
    }
}

function anonymousReportStatusUiToDb(ui: string): string {
    const m: Record<string, string> = {
        submitted: 'PENDING',
        in_review: 'IN_REVIEW',
        in_progress: 'IN_PROGRESS',
        resolved: 'RESOLVED',
        closed: 'CLOSED',
    };
    const k = ui.toLowerCase();
    return m[k] ?? ui.toUpperCase();
}

export async function updateAnonymousReport(
    reportId: string,
    data: {
        status?: string;
        responseNotes?: string;
        assignedTo?: string;
        priority?: string;
    }
) {
    const session = await auth();
    const allowedRoles = ['admin', 'hod', 'staff', 'advisor'];
    if (!session?.user?.id || !allowedRoles.includes(session.user.role || '')) {
        throw new Error('Unauthorized');
    }

    const patch: any = {};

    if (data.status !== undefined) {
        patch.status = anonymousReportStatusUiToDb(data.status);
    }
    if (data.responseNotes !== undefined) {
        patch.admin_notes = data.responseNotes.trim() || null;
    }
    if (data.assignedTo !== undefined) {
        patch.assigned_to = data.assignedTo.trim() || null;
    }
    if (data.priority !== undefined) {
        patch.priority = data.priority.toUpperCase();
    }

    const updated = await prisma.anonymousReport.update({
        where: { report_id: reportId },
        data: patch,
        include: { category: true }
    });

    // Trigger notification if assignment changed
    if (data.assignedTo !== undefined && data.assignedTo) {
        try {
            const assignee = await prisma.user.findUnique({
                where: { user_id: data.assignedTo }
            });

            if (assignee?.email) {
                const { dispatchNotificationEmail } = await import('@/lib/notifications/dispatch');
                const { NotificationEventKey } = await import('@/lib/notifications/events');

                await dispatchNotificationEmail({
                    eventKey: NotificationEventKey.REPORT_ASSIGNED,
                    dedupeKey: `report-assign-${reportId}-${data.assignedTo}`,
                    to: assignee.email,
                    recipientUserId: assignee.user_id,
                    entityType: 'ANONYMOUS_REPORT',
                    entityId: reportId,
                    vars: {
                        staffName: assignee.firstName || 'Staff',
                        reportTitle: updated.subject || 'No Subject',
                        reportCategory: updated.category?.name || 'Uncategorized',
                        reportPriority: updated.priority,
                    }
                });
            }
        } catch (e) {
            console.error('Failed to dispatch report assignment notification:', e);
        }
    }

    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_ANONYMOUS_REPORT_UPDATE',
        entityType: 'ANONYMOUS_REPORT',
        entityId: reportId,
        category: 'ADMIN',
        metadata: { status: updated.status, assigned_to: updated.assigned_to },
    });

    revalidatePath('/dashboard/admin/reports-review');
    revalidatePath('/dashboard/staff/reports-review');
    revalidatePath('/dashboard/hod/reports-review');
    return {
        success: true,
        data: {
            id: updated.report_id,
            status: anonymousReportStatusToUi(updated.status),
            responseNotes: updated.admin_notes ?? '',
            assignedTo: updated.assigned_to ?? updated.category?.assigned_to ?? '',
            reviewedAt: updated.updated_at.toISOString(),
        },
    };
}


// GPA CONFIG ACTIONS

export async function getAdminGpaConfigData() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') throw new Error("Unauthorized");

    await ensureDefaultGradingSchemeInDb();
    const activeScheme = await prisma.gradingScheme.findFirst({
        where: { active: true },
        include: { bands: { orderBy: { min_marks: 'desc' } } }
    });

    const gradePointScale =
        activeScheme?.bands?.length
            ? activeScheme.bands.map((b) => ({
                  id: b.band_id,
                  grade: b.letter_grade,
                  points: b.grade_point,
                  minMarks: b.min_marks,
                  maxMarks: b.max_marks,
              }))
            : DEFAULT_INSTITUTION_GRADING_BANDS.map((b, i) => ({
                  id: `default-${i}`,
                  grade: b.letter_grade,
                  points: b.grade_point,
                  minMarks: b.min_marks,
                  maxMarks: b.max_marks,
              }));

    return {
        gradePointScale,
    };
}

/** Persist only institution mark → letter → points bands (active grading scheme). Does not touch GPA settings tabs. */
export async function saveAdminGradingBands(
    gradeScale: {
        grade: string;
        points: number | string;
        minMarks: number | string;
        maxMarks: number | string;
    }[]
) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') throw new Error('Unauthorized');

    const payload = gradeScale.map((b) => ({
        letter_grade: String(b.grade ?? '').trim(),
        grade_point: typeof b.points === 'string' ? parseFloat(b.points) : b.points,
        min_marks: typeof b.minMarks === 'string' ? parseFloat(b.minMarks) : b.minMarks,
        max_marks: typeof b.maxMarks === 'string' ? parseFloat(b.maxMarks) : b.maxMarks,
    }));

    const v = validateBands(payload);
    if (!v.ok) {
        throw new Error(v.error);
    }

    await ensureDefaultGradingSchemeInDb();

    await prisma.$transaction(async (tx) => {
        let scheme = await tx.gradingScheme.findFirst({
            where: { active: true },
        });

        if (!scheme) {
            scheme = await tx.gradingScheme.create({
                data: { name: 'Main Grading Scheme', version: '1.0', active: true },
            });
        }

        await tx.gradingBand.deleteMany({
            where: { scheme_id: scheme.scheme_id },
        });

        await tx.gradingBand.createMany({
            data: v.bands.map((band) => ({
                scheme_id: scheme!.scheme_id,
                letter_grade: band.letter_grade,
                grade_point: band.grade_point,
                min_marks: band.min_marks,
                max_marks: band.max_marks,
            })),
        });
    });

    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_GRADING_BANDS_SAVE',
        entityType: 'GRADING_SCHEME',
        entityId: 'active',
        category: 'ADMIN',
        metadata: { bandCount: v.bands.length },
    });

    revalidatePath('/dashboard/admin/config/gpa');
    return { success: true as const };
}

// DEGREE PROGRAMS ACTIONS

export async function getAdminDegreeProgramsData() {
    const { getProgramsForAdminConfig } = await import('@/lib/actions/admin-programs');
    return getProgramsForAdminConfig();
}
