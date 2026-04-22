import { describe, it, expect, vi } from 'vitest';
import { registerForModules, getEnrollmentStats } from '@/lib/actions/enrollment-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { AcademicEngine } from '@/lib/services/academic-engine';

const prismaMock = prisma as any;

// Mock AcademicEngine
vi.mock('@/lib/services/academic-engine', () => ({
  AcademicEngine: {
    validateCreditLoad: vi.fn(),
    validatePrerequisites: vi.fn(),
    validateCapacity: vi.fn(),
  },
}));

describe('enrollment-actions', () => {
  describe('registerForModules', () => {
    it('should register for modules if validation passes', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1', role: 'student' } });
      prismaMock.student.findUnique.mockResolvedValue({ student_id: 's1', current_level: 'L1' });
      prismaMock.moduleRegistrationRound = {
          findMany: vi.fn().mockResolvedValue([{ 
              status: 'OPEN', 
              opens_at: new Date(Date.now() - 10000), 
              closes_at: new Date(Date.now() + 10000),
              levels: ['L1']
          }])
      };
      prismaMock.academicYear.findFirst.mockResolvedValue({ academic_year_id: 'y1' });
      prismaMock.semester.findFirst.mockResolvedValue({ semester_id: 'sem1' });
      
      (AcademicEngine.validateCreditLoad as any).mockResolvedValue({ allowed: true });
      (AcademicEngine.validatePrerequisites as any).mockResolvedValue({ isEligible: true });
      (AcademicEngine.validateCapacity as any).mockResolvedValue({ hasSpace: true });
      
      prismaMock.moduleRegistration.findMany.mockResolvedValue([]);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.moduleRegistration.createMany.mockResolvedValue({});

      const result = await registerForModules(['m1']);

      expect(result.success).toBe(true);
      expect(prismaMock.moduleRegistration.createMany).toHaveBeenCalled();
    });
  });

  describe('getEnrollmentStats', () => {
    it('should return stats for active modules', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'staff-1' } });
      prismaMock.module.findMany.mockResolvedValue([{
        module_id: 'm1',
        code: 'CS101',
        name: 'Intro',
        module_registrations: [{}, {}]
      }]);

      const result = await getEnrollmentStats();

      expect(result).toHaveLength(1);
      expect(result[0].enrolled).toBe(2);
      expect(result[0].percentage).toBe(2); // 2/100
    });
  });
});
