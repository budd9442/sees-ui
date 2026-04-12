'use server';

import { prisma } from '@/lib/db';

export async function getAdminMetrics() {
    const [totalUsers, activeUsers, activeModules, recentMetrics] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.module.count({ where: { active: true } }),
        prisma.systemMetric.findFirst({
            orderBy: { timestamp: 'desc' }
        })
    ]);

    return {
        users: {
            total: totalUsers,
            active: activeUsers,
            activeRecently: activeUsers // Simplified proxy
        },
        modules: {
            active: activeModules
        },
        system: {
            health: recentMetrics?.health || 100,
            uptime: recentMetrics?.uptime || 99.9,
            cpu: recentMetrics?.cpu || 0,
            memory: recentMetrics?.memory || 0
        }
    };
}

export async function getRecentActivity() {
    // Transitioned from proxies to the real AuditLog engine
    const logs = await prisma.auditLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' }
    });

    return logs.map(l => ({
        id: l.log_id,
        action: l.action.replace('_', ' '),
        user: l.admin_id,
        time: l.timestamp.toISOString(),
        status: 'success'
    }));
}

export async function getSystemSettingsCount() {
    const count = await prisma.systemSetting.count();
    return count;
}
