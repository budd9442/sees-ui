import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitAnonymousReport } from '@/lib/actions/report-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

vi.mock('@/auth');
vi.mock('@/lib/db', () => ({
  prisma: {
    student: { findUnique: vi.fn() },
    reportCategory: { findUnique: vi.fn() },
    anonymousReport: { create: vi.fn() },
  }
}));

// Mock dynamic imports for notifications
vi.mock('@/lib/notifications/dispatch', () => ({
  dispatchNotificationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

const prismaMock = prisma as any;

describe('report-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitAnonymousReport', () => {
    it('should throw error if not authenticated', async () => {
      (auth as any).mockResolvedValue(null);
      await expect(submitAnonymousReport({
        subject: 'Test',
        categoryId: 'c1',
        content: 'Content',
        priority: 'HIGH'
      })).rejects.toThrow('Unauthorized');
    });

    it('should submit report successfully', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({ student_id: 's1' });
      prismaMock.reportCategory.findUnique.mockResolvedValue({ id: 'c1', name: 'Academic', assigned_to: 'staff1@ex.com' });
      prismaMock.anonymousReport.create.mockResolvedValue({ report_id: 'r1', subject: 'Test', priority: 'HIGH' });

      const result = await submitAnonymousReport({
        subject: 'Test',
        categoryId: 'c1',
        content: 'Content',
        priority: 'HIGH'
      });

      expect(result.success).toBe(true);
      expect(prismaMock.anonymousReport.create).toHaveBeenCalled();
    });
  });
});
