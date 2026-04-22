import { describe, it, expect, vi } from 'vitest';
import { getStaffAnalyticsFilterOptions, getStaffAnalytics, getStaffModuleRoster } from '@/lib/actions/staff-subactions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('staff-subactions', () => {
  describe('getStaffAnalyticsFilterOptions', () => {
    it('should return filters for staff', async () => {
      (auth as any).mockResolvedValue({ user: { role: 'staff', id: 'staff-1' } });
      prismaMock.academicYear.findMany.mockResolvedValue([{ academic_year_id: 'y1', label: '2024' }]);
      const result = await getStaffAnalyticsFilterOptions();
      expect(result).toHaveLength(1);
    });
  });

  describe('getStaffAnalytics', () => {
    it('should return analytics for taught modules', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'staff-1' } });
      prismaMock.staff.findUnique.mockResolvedValue({
        staff_id: 'staff-1',
        assignments: [{
          module: { module_id: 'm1', code: 'CS101', name: 'Intro' },
          academic_year_id: 'y1'
        }]
      });
      prismaMock.moduleRegistration.findMany.mockResolvedValue([{
        student_id: 's1',
        module_id: 'm1',
        semester: { label: 'S1' },
        student: { degree_path: { name: 'CS' } },
        grade: { grade_point: 4, letter_grade: 'A' }
      }]);

      const result = await getStaffAnalytics();

      expect(result).toHaveLength(1);
      expect(result[0].grades).toHaveLength(1);
    });
  });

  describe('getStaffModuleRoster', () => {
    it('should return roster with student details', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'staff-1' } });
      prismaMock.staffAssignment.findFirst.mockResolvedValue({
        module: { module_id: 'm1', code: 'CS101', name: 'Intro', credits: 3 }
      });
      prismaMock.moduleRegistration.findMany.mockResolvedValue([{
        student_id: 's1',
        student: {
            student_id: 's1',
            user: { firstName: 'S', lastName: '1', email: 's1@ex.com' },
            degree_path: { name: 'CS' }
        }
      }]);

      const result = await getStaffModuleRoster('m1');

      expect(result.students).toHaveLength(1);
      expect(result.students[0].name).toBe('S 1');
    });
  });
});
