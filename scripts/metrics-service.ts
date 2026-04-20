import 'dotenv/config';
import {
  collectSystemMetricSample,
  pruneOldSystemMetrics,
} from '@/lib/monitoring/system-metrics';

const INTERVAL_MS = 60 * 1000; // 1 minute

async function runOnce() {
  const now = new Date().toISOString();
  try {
    const sample = await collectSystemMetricSample();
    const deleted = await pruneOldSystemMetrics();

    console.log(
      JSON.stringify(
        {
          timestamp: now,
          status: 'success',
          metricId: sample.id,
          pruned: deleted.count,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error(`[${now}] Metrics collection failed:`, error);
  }
}

async function main() {
  console.log(`[${new Date().toISOString()}] Starting metrics collection service (interval: ${INTERVAL_MS / 1000}s)...`);
  
  // Run immediately on start
  await runOnce();

  // Then loop
  setInterval(async () => {
    await runOnce();
  }, INTERVAL_MS);
}

main().catch((error) => {
  console.error('Fatal error in metrics service:', error);
  process.exit(1);
});
