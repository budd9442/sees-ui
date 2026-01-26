import { NextResponse } from 'next/server';
import si from 'systeminformation';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Background metrics collection endpoint
 * Called by cron job every minute to collect and store system metrics
 */
export async function GET() {
    try {
        console.log('[Metrics Collector] Starting collection...');

        // Fetch system metrics in parallel
        const [cpu, currentLoad, mem, fsSize, time, activeUsers] = await Promise.all([
            si.cpu(),
            si.currentLoad(),
            si.mem(),
            si.fsSize(),
            si.time(),
            prisma.user.count({ where: { status: 'ACTIVE' } })
        ]);

        // Calculate metrics (reuse logic from main metrics endpoint)
        const cpuUsage = Math.round(currentLoad.currentLoad);
        const memoryUsage = Math.round(((mem.total - mem.available) / mem.total) * 100);

        const primaryDisk = fsSize[0] || { used: 0, size: 1 };
        const storageUsedGB = primaryDisk.used / (1024 ** 3);
        const storageTotalGB = primaryDisk.size / (1024 ** 3);
        const storagePercent = Math.round((primaryDisk.used / primaryDisk.size) * 100);

        const uptimeHours = time.uptime / 3600;
        const uptimePercentage = uptimeHours > 720 ? 99.9 : Math.min((uptimeHours / 720) * 99.9, 99.9);

        const healthScore = Math.round(
            (100 - cpuUsage * 0.3) * 0.4 +
            (100 - memoryUsage * 0.5) * 0.3 +
            uptimePercentage * 0.3
        );

        // Save to database
        await prisma.systemMetric.create({
            data: {
                cpu: cpuUsage,
                cores: cpu.cores,
                memory: memoryUsage,
                storage_used: storageUsedGB,
                storage_total: storageTotalGB,
                storage_percent: storagePercent,
                uptime: Math.round(uptimePercentage * 10) / 10,
                health: Math.min(healthScore, 100),
                active_users: activeUsers,
            }
        });

        console.log('[Metrics Collector] Saved metrics successfully');

        // Cleanup old metrics (keep last 24 hours)
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const deleted = await prisma.systemMetric.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffTime
                }
            }
        });

        if (deleted.count > 0) {
            console.log(`[Metrics Collector] Cleaned up ${deleted.count} old metrics`);
        }

        return NextResponse.json({
            success: true,
            message: 'Metrics collected successfully',
            cleaned: deleted.count
        });
    } catch (error) {
        console.error('[Metrics Collector] Error collecting metrics:', error);
        return NextResponse.json(
            { error: 'Failed to collect metrics', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
