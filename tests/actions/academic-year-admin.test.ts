import { describe, it, expect, vi } from 'vitest';
import { getAdminAcademicYears, createAcademicYear, setActiveAcademicYear, deleteAcademicYear } from '@/lib/actions/academic-year-admin';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const prismaMock = prisma as any;

describe('academic-year-admin', () => {
  describe('getAdminAcademicYears', () => {
    it('should return list of years with stats', async () => {
      const mockYears = [{
        academic_year_id: 'y1',
        label: '2024/25',
        start_date: new Date(),
        end_date: new Date(),
        _count: { semesters: 2, programs: 5 }
      }];
      prismaMock.academicYear.findMany.mockResolvedValue(mockYears);

      const result = await getAdminAcademicYears();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].stats.semesterCount).toBe(2);
    });
  });

  describe('createAcademicYear', () => {
    it('should create year and 2 semesters for admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.academicYear.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.academicYear.create.mockResolvedValue({ academic_year_id: 'new-y' });
      prismaMock.semester.createMany.mockResolvedValue({});

      const result = await createAcademicYear({
        label: '2025/26',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31')
      });

      expect(result.success).toBe(true);
      expect(prismaMock.academicYear.create).toHaveBeenCalled();
      expect(prismaMock.semester.createMany).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalled();
    });

    it('should return error if not admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1', role: 'student' } });
      const result = await createAcademicYear({ label: 'x', startDate: new Date(), endDate: new Date() });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('setActiveAcademicYear', () => {
    it('should activate one and deactivate others', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.$transaction.mockResolvedValue([]);

      const result = await setActiveAcademicYear('y1');

      expect(result.success).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('deleteAcademicYear', () => {
    it('should delete year if not active and no links', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.academicYear.findUnique.mockResolvedValue({
        academic_year_id: 'y1',
        active: false,
        _count: { staff_assignments: 0, intakes: 0 }
      });
      prismaMock.$transaction.mockResolvedValue([]);

      const result = await deleteAcademicYear('y1');

      expect(result.success).toBe(true);
    });

    it('should throw error if year is active', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.academicYear.findUnique.mockResolvedValue({
        academic_year_id: 'y1',
        active: true,
        _count: { staff_assignments: 0, intakes: 0 }
      });

      const result = await deleteAcademicYear('y1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('active');
    });
  });
});
