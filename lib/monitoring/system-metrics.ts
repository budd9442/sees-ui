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
