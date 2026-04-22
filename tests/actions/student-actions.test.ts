import { describe, it, expect, vi } from 'vitest';
import { getStudentDashboardData, getStudentGrades } from '@/lib/actions/student-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { AcademicEngine } from '@/lib/services/academic-engine';

const prismaMock = prisma as any;

// Mock AcademicEngine
vi.mock('@/lib/services/academic-engine', () => ({
  AcademicEngine: {
    calculateStudentGPA: vi.fn(),
  },
}));

describe('student-actions', () => {
  describe('getStudentDashboardData', () => {
    it('should return dashboard data for student', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'student-1', email: 'student@example.com' } });
      
      prismaMock.user.findUnique.mockResolvedValue({ user_id: 'student-1', email: 'student@example.com' });
      prismaMock.student.findUnique.mockResolvedValue({
        student_id: 'student-1',
        user: { firstName: 'Student', lastName: 'User', status: 'ACTIVE' },
        degree_path: { code: 'CS' },
        grades: [],
        module_registrations: [],
      });
      
      (AcademicEngine.calculateStudentGPA as any).mockResolvedValue({
        gpa: 3.5,
        totalCredits: 30,
        academicClass: 'First Class',
      });
      
      prismaMock.notification.findMany.mockResolvedValue([]);
      prismaMock.lectureSchedule.findMany.mockResolvedValue([]);
      prismaMock.systemSetting.findUnique.mockResolvedValue({ value: '132' });

      const result = await getStudentDashboardData();

      expect(result!.student.currentGPA).toBe(3.5);
      expect(result!.student.degreeProgram).toBe('CS');
      expect(AcademicEngine.calculateStudentGPA).toHaveBeenCalledWith('student-1');
    });
  });

  describe('getStudentGrades', () => {
    it('should return mapped grades', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'student-1', email: 'student@example.com' } });
      prismaMock.user.findUnique.mockResolvedValue({ user_id: 'student-1' });
      prismaMock.student.findUnique.mockResolvedValue({
        student_id: 'student-1',
        module_registrations: [
          {
            reg_id: 'reg-1',
            module: { code: 'CS101', name: 'Intro', credits: 3 },
            semester: { label: 'Sem 1' },
            grade: { letter_grade: 'A', grade_point: 4.0, released_at: new Date() },
          }
        ]
      });

      const result = await getStudentGrades();

      expect(result).toHaveLength(1);
      expect(result[0].grade).toBe('A');
      expect(result[0].isReleased).toBe(true);
    });
  });
});
