import { NextResponse } from 'next/server';
import {
    collectSystemMetricSample,
    pruneOldSystemMetrics,
    SYSTEM_METRIC_RETENTION_HOURS,
} from '@/lib/monitoring/system-metrics';

export const dynamic = 'force-dynamic';

/**
 * Background metrics collection endpoint
 * Called by cron job every minute to collect and store system metrics.
 * Configure your scheduler to GET this URL with header:
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: Request) {
    const secret = process.env.CRON_SECRET;
    const auth = req.headers.get('authorization');
    if (!secret || auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[Metrics Collector] Starting collection...');
        await collectSystemMetricSample();

        console.log('[Metrics Collector] Saved metrics successfully');

        // Cleanup old metrics.
        const deleted = await pruneOldSystemMetrics();

        if (deleted.count > 0) {
            console.log(`[Metrics Collector] Cleaned up ${deleted.count} old metrics`);
        }

        return NextResponse.json({
            success: true,
            message: 'Metrics collected successfully',
            retentionHours: SYSTEM_METRIC_RETENTION_HOURS,
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
