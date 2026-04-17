import 'dotenv/config';
import {
  collectSystemMetricSample,
  pruneOldSystemMetrics,
  SYSTEM_METRIC_RETENTION_HOURS,
} from '@/lib/monitoring/system-metrics';

async function main() {
  const sample = await collectSystemMetricSample();
  const deleted = await pruneOldSystemMetrics();

  console.log(
    JSON.stringify(
      {
        ok: true,
        metricId: sample.id,
        retentionHours: SYSTEM_METRIC_RETENTION_HOURS,
        pruned: deleted.count,
        timestamp: sample.timestamp.toISOString(),
      },
      null,
      2
    )
  );

  // Some app imports keep long-lived handles (e.g. queue connections).
  // Explicitly exit so scheduler runs do not hang.
  process.exit(0);
}

main().catch((error) => {
  console.error('[collect-system-metrics] failed:', error);
  process.exit(1);
});
