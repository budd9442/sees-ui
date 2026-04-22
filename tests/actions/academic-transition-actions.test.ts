import { describe, it, expect, vi } from 'vitest';
import { getBatchOverviewForOperator, executeBatchTransition } from '@/lib/actions/academic-transition-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('academic-transition-actions', () => {
  describe('getBatchOverviewForOperator', () => {
    it('should return overview for admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.student.groupBy.mockResolvedValue([
        { current_level: 'Level 1', _count: { student_id: 10 } },
        { current_level: 'Level 2', _count: { student_id: 5 } }
      ]);

      const result = await getBatchOverviewForOperator();

      expect(result.success).toBe(true);
      expect(result.data).toContainEqual({ level: 'L1', count: 10 });
      expect(result.data).toContainEqual({ level: 'L2', count: 5 });
    });
  });

  describe('executeBatchTransition', () => {
    it('should promote students and log audit', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.student.findMany.mockResolvedValue([
        { student_id: 's1', user: { email: 's1@ex.com', firstName: 'S', lastName: '1' } }
      ]);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.student.updateMany.mockResolvedValue({ count: 1 });

      const result = await executeBatchTransition('L1', 'L2');

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(prismaMock.student.updateMany).toHaveBeenCalledWith({
        where: { current_level: 'Level 1', enrollment_status: 'ENROLLED' },
        data: { current_level: 'Level 2' }
      });
    });

    it('should throw error for illegal transition', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      const result = await executeBatchTransition('L1', 'L3');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Illegal transition');
    });
  });
});
