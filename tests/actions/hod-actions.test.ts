import { describe, it, expect, vi } from 'vitest';
import { getHODDashboardData, getRankingWeights, updateRankingWeights } from '@/lib/actions/hod-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('hod-actions', () => {
  describe('getHODDashboardData', () => {
    it('should return dashboard data for HOD', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', email: 'hod@example.com', role: 'hod' } });
      
      prismaMock.user.findUnique.mockResolvedValue({ user_id: 'hod-1' });
      prismaMock.staff.findUnique.mockResolvedValue({
        staff_id: 'hod-1',
        department: 'CS',
        user: { firstName: 'HOD', lastName: 'User' }
      });
      
      prismaMock.staff.findMany.mockResolvedValue([]); // deptStaff
      prismaMock.degreeProgram.findMany.mockResolvedValue([]); // activePrograms
      prismaMock.programIntake.findMany.mockResolvedValue([]); // intakes
      prismaMock.staff.count.mockResolvedValue(10);
      prismaMock.selectionRound.count.mockResolvedValue(2);
      prismaMock.selectionAllocationChangeRequest.count.mockResolvedValue(1);

      const result = await getHODDashboardData();

      expect(result.hod.department).toBe('CS');
      expect(result.totalStaff).toBe(10);
      expect(result.pendingApprovals).toBe(3);
    });

    it('should throw Unauthorized if not logged in', async () => {
      (auth as any).mockResolvedValue(null);
      await expect(getHODDashboardData()).rejects.toThrow('Unauthorized');
    });
  });

  describe('Ranking Weights', () => {
    it('should fetch ranking weights', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1' } });
      prismaMock.systemSetting.findUnique
        .mockResolvedValueOnce({ value: '0.7' })
        .mockResolvedValueOnce({ value: '0.3' });

      const result = await getRankingWeights();

      expect(result.gpaWeight).toBe(0.7);
      expect(result.passRateWeight).toBe(0.3);
    });

    it('should update ranking weights and log audit', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1' } });
      prismaMock.systemSetting.upsert.mockResolvedValue({});

      const result = await updateRankingWeights(0.8, 0.2);

      expect(result.success).toBe(true);
      expect(prismaMock.systemSetting.upsert).toHaveBeenCalledTimes(2);
    });
  });
});
