import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAcademicRecoveryData, regenerateAcademicRecoveryPlan } from '@/lib/actions/monitoring-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { GPAMonitoringService } from '@/lib/services/gpa-monitoring';
import { AIService } from '@/lib/services/ai-service';

vi.mock('@/auth');
vi.mock('@/lib/db', () => ({
  prisma: {
    student: { findUnique: vi.fn() },
    academicRecoverySnapshot: { findUnique: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    advisor: { findFirst: vi.fn() },
  }
}));
vi.mock('@/lib/services/gpa-monitoring');
vi.mock('@/lib/services/ai-service');

const prismaMock = prisma as any;

describe('monitoring-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAcademicRecoveryData', () => {
    it('should return no dip if trajectory is stable', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      (GPAMonitoringService.getStudentGPAGraph as any).mockResolvedValue({ dipDetected: false });

      const result = await getAcademicRecoveryData();

      expect(result.dipDetected).toBe(false);
    });

    it('should return cached advice if fingerprint matches', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      (GPAMonitoringService.getStudentGPAGraph as any).mockResolvedValue({ 
        dipDetected: true, 
        previousGPA: 3.8, 
        currentGPA: 3.2,
        dipAmount: 0.6
      });
      prismaMock.academicRecoverySnapshot.findUnique.mockResolvedValue({ advice_json: { plan: 'cached' } });
      prismaMock.student.findUnique.mockResolvedValue({ student_id: 's1', advisor: null });

      const result = await getAcademicRecoveryData();

      expect(result.dipDetected).toBe(true);
      expect(result.advice.plan).toBe('cached');
      expect(AIService.generateAcademicRecoveryAdvice).not.toHaveBeenCalled();
    });

    it('should generate new advice if no cache exists', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      (GPAMonitoringService.getStudentGPAGraph as any).mockResolvedValue({ 
        dipDetected: true, 
        previousGPA: 3.8, 
        currentGPA: 3.2,
        dipAmount: 0.6
      });
      prismaMock.academicRecoverySnapshot.findUnique.mockResolvedValue(null);
      (AIService.generateAcademicRecoveryAdvice as any).mockResolvedValue({ plan: 'new' });
      prismaMock.student.findUnique.mockResolvedValue({ student_id: 's1' });

      const result = await getAcademicRecoveryData();

      expect(result.advice.plan).toBe('new');
      expect(prismaMock.academicRecoverySnapshot.create).toHaveBeenCalled();
    });
  });

  describe('regenerateAcademicRecoveryPlan', () => {
    it('should delete snapshot and re-fetch data', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      (GPAMonitoringService.getStudentGPAGraph as any).mockResolvedValue({ 
        dipDetected: true, 
        previousGPA: 3.8, 
        currentGPA: 3.2
      });
      prismaMock.academicRecoverySnapshot.findUnique.mockResolvedValue({ advice_json: {} });
      prismaMock.student.findUnique.mockResolvedValue({ student_id: 's1' });

      await regenerateAcademicRecoveryPlan();

      expect(prismaMock.academicRecoverySnapshot.deleteMany).toHaveBeenCalled();
    });
  });
});
