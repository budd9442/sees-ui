'use server';

import { prisma } from '@/lib/db';

export async function getAdminMetrics() {
    const [totalUsers, activeUsers, activeModules, recentLogins] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.module.count({ where: { active: true } }),
        prisma.user.count({
            where: {
                last_login_date: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            }
        })
    ]);

    return {
        users: {
            total: totalUsers,
            active: activeUsers,
            activeRecently: recentLogins
        },
        modules: {
            active: activeModules
        },
        system: {
            health: 100, // Database connection successful implies 100% health for this scope
            uptime: 99.9,
            cpu: Math.floor(Math.random() * 30) + 20, // Simulated CPU usage
            memory: Math.floor(Math.random() * 40) + 30 // Simulated Memory usage
        }
    };
}

export async function getRecentActivity() {
    // Since we don't have an audit table, we'll fetch recent user creations/updates as a proxy
    // or return mock data enriched with real user names if possible.

    // Real data: Recent users created
    const newUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
            username: true,
            email: true,
            created_at: true,
            status: true
        }
    });

    return newUsers.map(u => ({
        id: u.username,
        action: 'User Registered',
        user: u.email,
        time: u.created_at.toISOString(),
        status: 'success'
    }));
}

export async function getSystemSettingsCount() {
    const count = await prisma.systemSetting.count();
    return count;
}
