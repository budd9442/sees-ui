import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { collectSystemMetricSample, downsampleMetrics } from '@/lib/monitoring/system-metrics';

export const dynamic = 'force-dynamic';

const SAMPLE_INTERVAL_MS = 60_000;

/**
 * Returns historical system metrics from database with downsampling.
 * Query params: ?window=1h|6h|24h|7d (default: 1h)
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const window = searchParams.get('window') || '1h';

        // Map window to hours and target points
        const windowConfig: Record<string, { hours: number; targetPoints: number }> = {
            '1h': { hours: 1, targetPoints: 12 }, // ~5 min intervals for detail
            '6h': { hours: 6, targetPoints: 6 },  // 1 hour intervals
            '24h': { hours: 24, targetPoints: 24 }, // 1 hour intervals
            '7d': { hours: 168, targetPoints: 168 }, // 1 hour intervals
        };


        const config = windowConfig[window] || windowConfig['1h'];
        const cutoffTime = new Date(Date.now() - config.hours * 60 * 60 * 1000);

        // Fallback sampler: when cron is not running, create one sample per minute
        // during dashboard activity so the chart still accumulates history.
        if (window === '1h') {
            const latest = await prisma.systemMetric.findFirst({
                orderBy: { timestamp: 'desc' },
                select: { timestamp: true },
            });
            const latestAgeMs = latest ? Date.now() - latest.timestamp.getTime() : Number.POSITIVE_INFINITY;
            if (latestAgeMs >= SAMPLE_INTERVAL_MS) {
                await collectSystemMetricSample();
            }
        }

        // Fetch metrics for the requested window
        const metrics = await prisma.systemMetric.findMany({
            where: {
                timestamp: { gte: cutoffTime }
            },
            orderBy: { timestamp: 'asc' }, // Get chronological order directly
            select: {
                id: true,
                timestamp: true,
                cpu: true,
                cores: true,
                memory: true,
                storage_used: true,
                storage_total: true,
                storage_percent: true,
                uptime: true,
                health: true,
                active_users: true,
            }
        });

        // Apply downsampling
        const downsampled = downsampleMetrics(metrics, config.targetPoints);

        // Format storage for display
        const formatStorage = (gb: number) => {
            if (gb >= 1024) {
                return `${(gb / 1024).toFixed(1)}TB`;
            }
            return `${gb.toFixed(1)}GB`;
        };

        // Transform data for frontend
        const formattedMetrics = downsampled.map(metric => ({
            id: metric.id,
            timestamp: metric.timestamp.toISOString(),
            cpu: metric.cpu,
            cores: metric.cores,
            memory: metric.memory,
            storageUsed: formatStorage(metric.storage_used),
            storageTotal: formatStorage(metric.storage_total),
            storagePercentage: metric.storage_percent,
            uptime: metric.uptime,
            health: metric.health,
            activeUsers: metric.active_users,
        }));

        return NextResponse.json(formattedMetrics);

    } catch (error) {
        console.error('Error fetching system metrics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch system metrics' },
            { status: 500 }
        );
    }
}
