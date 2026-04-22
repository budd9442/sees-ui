import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCategorizedSettings, updateSystemSettingWithAudit, getPublicSystemInfo } from '@/lib/actions/system-settings-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

vi.mock('@/auth');
vi.mock('@/lib/db', () => ({
  prisma: {
    systemSetting: { findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn() },
    auditLog: { findMany: vi.fn() },
  }
}));

const prismaMock = prisma as any;

describe('system-settings-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCategorizedSettings', () => {
    it('should throw if not admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1', role: 'student' } });
      await expect(getCategorizedSettings()).rejects.toThrow('Unauthorized');
    });

    it('should return categorized settings', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin1', role: 'admin' } });
      prismaMock.systemSetting.findMany.mockResolvedValue([
        { key: 'k1', category: 'ACADEMIC' },
        { key: 'k2', category: 'SYSTEM' }
      ]);

      const result = await getCategorizedSettings();

      expect(result.ACADEMIC).toHaveLength(1);
      expect(result.SYSTEM).toHaveLength(1);
    });
  });

  describe('updateSystemSettingWithAudit', () => {
    it('should update setting and create audit log', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin1', role: 'admin' } });
      prismaMock.systemSetting.findUnique.mockResolvedValue({ value: 'old' });
      prismaMock.systemSetting.upsert.mockResolvedValue({ setting_id: 's1' });

      const result = await updateSystemSettingWithAudit('k1', 'new');

      expect(result.success).toBe(true);
      expect(prismaMock.systemSetting.upsert).toHaveBeenCalled();
    });
  });

  describe('getPublicSystemInfo', () => {
    it('should return public keys', async () => {
      prismaMock.systemSetting.findMany.mockResolvedValue([
        { key: 'institution_name', value: 'SEES' },
        { key: 'maintenance_mode', value: 'false' }
      ]);

      const result = await getPublicSystemInfo();

      expect(result.institutionName).toBe('SEES');
      expect(result.maintenanceMode).toBe(false);
    });
  });
});
