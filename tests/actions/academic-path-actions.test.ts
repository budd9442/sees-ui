import { describe, it, expect, vi } from 'vitest';
import { getAvailableSpecializedPaths, selectSpecializedPath } from '@/lib/actions/academic-path-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('academic-path-actions', () => {
  describe('getAvailableSpecializedPaths', () => {
    it('should return available paths for student', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({
        student_id: 's1',
        degree_path_id: 'p1',
        current_level: 'L1',
        admission_year: 2024
      });
      prismaMock.selectionRound.findFirst.mockResolvedValue({
        opens_at: new Date(Date.now() - 1000),
        closes_at: new Date(Date.now() + 1000)
      });
      prismaMock.academicYear.findFirst.mockResolvedValue({ active: true });
      prismaMock.student.count.mockResolvedValue(100);
      prismaMock.academicPathTransition.findMany.mockResolvedValue([{
        target_program_id: 'p2',
        target_program: { name: 'Specialized' }
      }]);
      prismaMock.student.findMany.mockResolvedValue([]);

      const result = await getAvailableSpecializedPaths();

      expect(result.status).toBe('AVAILABLE');
      expect(result.paths).toHaveLength(1);
    });
  });

  describe('selectSpecializedPath', () => {
    it('should update student preference', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({ student_id: 's1' });
      prismaMock.student.update.mockResolvedValue({});

      const result = await selectSpecializedPath('p2');

      expect(result.success).toBe(true);
      expect(prismaMock.student.update).toHaveBeenCalled();
    });
  });
});
