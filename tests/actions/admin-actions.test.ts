import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAdminDashboardData, getSystemMonitoringData, getAdminNotificationsData, createAdminNotificationTemplate } from '@/lib/actions/admin-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import * as backupActions from '@/lib/actions/backup-actions';

vi.mock('@/lib/actions/backup-actions', () => ({
    getBackupsList: vi.fn().mockResolvedValue([]),
    getAdminBackupsData: vi.fn().mockResolvedValue({ backups: [] }),
    createAdminBackup: vi.fn().mockResolvedValue({ success: true }),
    deleteAdminBackup: vi.fn().mockResolvedValue({ success: true }),
    restoreAdminBackup: vi.fn().mockResolvedValue({ success: true }),
    downloadBackupAsBase64: vi.fn().mockResolvedValue({ base64: '' }),
}));

const prismaMock = prisma as any;

describe('admin-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.auditLog.findMany.mockResolvedValue([]);
    prismaMock.notificationDispatchLog.findMany.mockResolvedValue([]);
    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.student.count.mockResolvedValue(0);
    prismaMock.staff.count.mockResolvedValue(0);
    prismaMock.auditLog.count.mockResolvedValue(0);
    prismaMock.notificationDispatchLog.count.mockResolvedValue(0);
    prismaMock.gPAHistory.count.mockResolvedValue(0);
  });

  describe('getAdminDashboardData', () => {
    it('should return aggregated system metrics for admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', email: 'admin@ex.com' } });
      prismaMock.user.findUnique.mockResolvedValue({ user_id: 'admin-1', role: 'admin', firstName: 'Admin', lastName: 'User' });
      prismaMock.user.count.mockResolvedValue(100);
      prismaMock.student.count.mockResolvedValue(80);
      prismaMock.staff.count.mockResolvedValue(20);
      prismaMock.systemMetric.findFirst.mockResolvedValue({ 
          health: 95, 
          cpu: 10, 
          memory: 20, 
          storage_used: 1, 
          storage_total: 10, 
          uptime: 99.9,
          timestamp: new Date()
      });
      prismaMock.systemMetric.findMany.mockResolvedValue([]);
      prismaMock.notificationDispatchLog.count.mockResolvedValue(5);
      prismaMock.auditLog.count.mockResolvedValue(2);
      prismaMock.gPAHistory.count.mockResolvedValue(10);
      prismaMock.auditLog.findMany.mockResolvedValue([{
          log_id: 'l1',
          timestamp: new Date(),
          action: 'LOGIN',
          entity_type: 'USER',
          entity_id: 'u1',
          category: 'AUTH',
          metadata: {}
      }]);
      prismaMock.$queryRaw.mockResolvedValue([{ size: BigInt(1024 * 1024 * 100) }]); // 100MB

      const result = await getAdminDashboardData();

      expect(result).not.toBeNull();
      expect(result.totalUsers).toBe(100);
      expect(result.systemMetrics.healthScore).toBe(95);
    });
  });

  describe('getSystemMonitoringData', () => {
    it('should return detailed monitoring stats', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', email: 'admin@ex.com', role: 'admin' } });
      prismaMock.user.findUnique.mockResolvedValue({ user_id: 'admin-1', role: 'admin' });
      prismaMock.systemMetric.findFirst.mockResolvedValue({ health: 95, cpu: 10, memory: 20, storage_percent: 15, uptime: 99.9 });
      prismaMock.notificationDispatchLog.count.mockResolvedValue(10);
      prismaMock.auditLog.count.mockResolvedValue(5);
      prismaMock.systemSetting.findMany.mockResolvedValue([{ setting_id: 's1', key: 'k1', value: 'v1', updated_at: new Date() }]);

      const result = await getSystemMonitoringData();

      expect(result.metrics.healthScore).toBe(95);
      expect(result.configs).toHaveLength(1);
    });
  });

  describe('getAdminNotificationsData', () => {
    it('should return templates and triggers', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.notificationEmailTemplate.findMany.mockResolvedValue([{
          template_id: 't1',
          name: 'Welcome',
          event_key: 'USER_WELCOME',
          subject: 'Hi',
          body: 'Welcome',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
      }]);
      prismaMock.notificationTriggerConfig.findMany.mockResolvedValue([{
          event_key: 'USER_WELCOME',
          enabled: true,
          config_json: {}
      }]);

      const result = await getAdminNotificationsData();

      expect(result.templates).toHaveLength(1);
      expect(result.triggers).toHaveLength(1);
    });
  });

  describe('createAdminNotificationTemplate', () => {
    it('should create new template and log audit', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.notificationEmailTemplate.create.mockResolvedValue({
          template_id: 'new-t',
          name: 'New',
          event_key: 'GENERAL',
          subject: 'S',
          body: 'B',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
      });
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await createAdminNotificationTemplate({
          name: 'New',
          category: 'GENERAL' as any,
          subject: 'S',
          body: 'B'
      });

      expect(result.success).toBe(true);
      expect(prismaMock.notificationEmailTemplate.create).toHaveBeenCalled();
    });
  });
});
