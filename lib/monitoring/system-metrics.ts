import si from 'systeminformation';
import { prisma } from '@/lib/db';

export const SYSTEM_METRIC_RETENTION_HOURS = 24;

export async function collectSystemMetricSample() {
  const [cpu, currentLoad, mem, fsSize, time, activeUsers] = await Promise.all([
    si.cpu(),
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.time(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
  ]);

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

  return prisma.systemMetric.create({
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
    },
  });
}

export async function pruneOldSystemMetrics(retentionHours = SYSTEM_METRIC_RETENTION_HOURS) {
  const cutoffTime = new Date(Date.now() - retentionHours * 60 * 60 * 1000);
  return prisma.systemMetric.deleteMany({
    where: {
      timestamp: {
        lt: cutoffTime,
      },
    },
  });
}

export interface SystemMetricData {
  timestamp: Date;
  cpu: number;
  memory: number;
  health: number;
  active_users: number;
  [key: string]: any;
}

/**
 * Downsamples a set of metrics to a target number of points using averaging.
 * Useful for displaying long time ranges without fetching thousands of points.
 */
export function downsampleMetrics<T extends SystemMetricData>(data: T[], targetPoints: number): T[] {
  if (data.length <= targetPoints || targetPoints <= 0) return data;

  const result: T[] = [];
  const bucketSize = data.length / targetPoints;

  for (let i = 0; i < targetPoints; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);
    const bucket = data.slice(start, end);

    if (bucket.length === 0) continue;

    // Average the numeric values
    const averaged = { ...bucket[0] };
    const numericKeys = ['cpu', 'memory', 'health', 'active_users'];

    numericKeys.forEach(key => {
      const sum = bucket.reduce((s, item) => s + (item[key] || 0), 0);
      (averaged as any)[key] = Math.round(sum / bucket.length);
    });

    // Use the middle timestamp for the bucket
    averaged.timestamp = bucket[Math.floor(bucket.length / 2)].timestamp;

    result.push(averaged);
  }

  return result;
}
