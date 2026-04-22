import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAdminMetrics, getRecentActivity, getSystemSettingsCount } from '@/lib/actions/admin';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { count: vi.fn() },
    module: { count: vi.fn() },
    systemMetric: { findFirst: vi.fn() },
    auditLog: { findMany: vi.fn() },
    systemSetting: { count: vi.fn() },
  }
}));

const prismaMock = prisma as any;

describe('admin-lib-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdminMetrics', () => {
    it('should return system metrics', async () => {
      prismaMock.user.count.mockResolvedValue(10);
      prismaMock.module.count.mockResolvedValue(5);
      prismaMock.systemMetric.findFirst.mockResolvedValue({ health: 90 });

      const result = await getAdminMetrics();

      expect(result.users.total).toBe(10);
      expect(result.system.health).toBe(90);
    });
  });

  describe('getRecentActivity', () => {
    it('should return mapped activity logs', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([{
        log_id: 'l1',
        action: 'USER_CREATE',
        admin_id: 'a1',
        timestamp: new Date()
      }]);

      const result = await getRecentActivity();

      expect(result).toHaveLength(1);
      expect(result[0].action).toBe('USER CREATE');
    });
  });

  describe('getSystemSettingsCount', () => {
    it('should return count', async () => {
      prismaMock.systemSetting.count.mockResolvedValue(42);
      const result = await getSystemSettingsCount();
      expect(result).toBe(42);
    });
  });
});
