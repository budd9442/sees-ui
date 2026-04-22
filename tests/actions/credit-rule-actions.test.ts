import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAcademicCreditRules, saveCreditRule, deleteCreditRule } from '@/lib/actions/credit-rule-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

vi.mock('@/auth');
vi.mock('@/lib/db', () => ({
  prisma: {
    academicCreditRule: { findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn(), create: vi.fn(), delete: vi.fn() },
  }
}));

const prismaMock = prisma as any;

describe('credit-rule-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAcademicCreditRules', () => {
    it('should return all rules', async () => {
      prismaMock.academicCreditRule.findMany.mockResolvedValue([{ id: 'r1' }]);
      const result = await getAcademicCreditRules();
      expect(result).toHaveLength(1);
    });
  });

  describe('saveCreditRule', () => {
    it('should throw error if not admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1', role: 'student' } });
      await expect(saveCreditRule({ level: 'L1', semester_number: 1, min_credits: 12, max_credits: 20 }))
        .rejects.toThrow('Unauthorized');
    });

    it('should upsert rule if admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin1', role: 'admin' } });
      prismaMock.academicCreditRule.findFirst.mockResolvedValue(null);
      prismaMock.academicCreditRule.create.mockResolvedValue({ id: 'new-r' });

      const result = await saveCreditRule({ level: 'L1', semester_number: 1, min_credits: 12, max_credits: 20 });

      expect(result.success).toBe(true);
      expect(prismaMock.academicCreditRule.create).toHaveBeenCalled();
    });
  });

  describe('deleteCreditRule', () => {
    it('should delete rule and return success', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin1', role: 'admin' } });
      prismaMock.academicCreditRule.delete.mockResolvedValue({});

      const result = await deleteCreditRule('r1');

      expect(result.success).toBe(true);
      expect(prismaMock.academicCreditRule.delete).toHaveBeenCalled();
    });
  });
});
