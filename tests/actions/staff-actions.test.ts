import { describe, it, expect, vi } from 'vitest';
import { getStaffDashboardData, updateStudentGrade, getStaffSchedules } from '@/lib/actions/staff-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('staff-actions', () => {
  describe('getStaffDashboardData', () => {
    it('should return metrics and modules for staff', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'staff-1' } });
      prismaMock.user.findUnique.mockResolvedValue({ firstName: 'Staff', lastName: 'User', email: 's@ex.com' });
      prismaMock.staffAssignment.findMany.mockResolvedValue([{
        assignment_id: 'a1',
        module: { module_id: 'm1', code: 'CS101', name: 'Intro' },
        academic_year: { label: '2024' }
      }]);
      prismaMock.moduleRegistration.count.mockResolvedValue(10);
      prismaMock.moduleRegistration.findMany.mockResolvedValue([]);
      prismaMock.academicYear.findFirst.mockResolvedValue({ academic_year_id: 'y1' });
      prismaMock.grade.count.mockResolvedValue(5);
      prismaMock.lectureSchedule.count.mockResolvedValue(2);
      prismaMock.grade.findMany.mockResolvedValue([{ letter_grade: 'A' }]);
      prismaMock.auditLog.findMany.mockResolvedValue([]);
      prismaMock.lectureSchedule.findMany.mockResolvedValue([]);
      prismaMock.semester.findMany.mockResolvedValue([]);

      const result = await getStaffDashboardData();

      expect(result!.staff.firstName).toBe('Staff');
      expect(result!.totalStudents).toBeGreaterThanOrEqual(0);
      expect(result!.gradeDistribution).toHaveLength(5);
    });
  });

  describe('updateStudentGrade', () => {
    it('should upsert grade based on marks', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'staff-1' } });
      prismaMock.moduleRegistration.findUnique.mockResolvedValue({
        reg_id: 'r1',
        student_id: 's1',
        module_id: 'm1',
        semester_id: 'sem1'
      });
      prismaMock.staffAssignment.findFirst.mockResolvedValue({ assignment_id: 'a1' });
      prismaMock.module.findUnique.mockResolvedValue({ custom_grading_bands: null });
      prismaMock.gradingScheme.findFirst.mockResolvedValue({ bands: [{ min_marks: 0, max_marks: 100, letter_grade: 'A', grade_point: 4 }] });
      prismaMock.grade.upsert.mockResolvedValue({});

      const result = await updateStudentGrade('r1', { marks: 85 });

      expect(result.success).toBe(true);
      expect(prismaMock.grade.upsert).toHaveBeenCalled();
    });
  });

  describe('getStaffSchedules', () => {
    it('should return staff timetable', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'staff-1' } });
      prismaMock.lectureSchedule.findMany.mockResolvedValue([{ schedule_id: 'sch1' }]);
      const result = await getStaffSchedules();
      expect(result).toHaveLength(1);
    });
  });
});
