import { describe, it, expect, vi } from 'vitest';
import { updateAcademicThresholds, updateGradingScheme, ensureDefaultSettings } from '@/lib/actions/grading-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('grading-actions', () => {
  describe('updateAcademicThresholds', () => {
    it('should upsert multiple settings in a transaction', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.$transaction.mockImplementation(async (promises: any) => Promise.all(promises));
      prismaMock.systemSetting.upsert.mockResolvedValue({});

      const result = await updateAcademicThresholds({ 't1': '3.5', 't2': '2.0' });

      expect(result.success).toBe(true);
      expect(prismaMock.systemSetting.upsert).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateGradingScheme', () => {
    it('should replace bands for a scheme', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.gradingBand.deleteMany.mockResolvedValue({});
      prismaMock.gradingBand.createMany.mockResolvedValue({});

      const result = await updateGradingScheme('scheme1', [{ letter: 'A', points: 4, minMarks: 80, maxMarks: 100 }]);

      expect(result.success).toBe(true);
      expect(prismaMock.gradingBand.deleteMany).toHaveBeenCalled();
      expect(prismaMock.gradingBand.createMany).toHaveBeenCalled();
    });
  });

  describe('ensureDefaultSettings', () => {
    it('should create default settings and scheme if missing', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.systemSetting.upsert.mockResolvedValue({});
      prismaMock.gradingScheme.findFirst.mockResolvedValue(null);
      prismaMock.gradingScheme.create.mockResolvedValue({ scheme_id: 's1' });
      prismaMock.gradingBand.createMany.mockResolvedValue({});

      const result = await ensureDefaultSettings();

      expect(result.success).toBe(true);
      expect(prismaMock.gradingScheme.create).toHaveBeenCalled();
    });
  });
});
