import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Returns historical system metrics from database
 * Frontend uses this to populate the performance graph and metric cards
 */
export async function GET() {
    try {
        // Get last 60 minutes of metrics (60 records at 1-minute intervals)
        const metrics = await prisma.systemMetric.findMany({
            orderBy: { timestamp: 'desc' },
            take: 60,
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

        // Return in chronological order (oldest first) for graph display
        const chronological = metrics.reverse();

        // Format storage for display
        const formatStorage = (gb: number) => {
            if (gb >= 1000) {
                return `${(gb / 1024).toFixed(1)}TB`;
            }
            return `${gb.toFixed(1)}GB`;
        };

        // Transform data for frontend
        const formattedMetrics = chronological.map(metric => ({
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
