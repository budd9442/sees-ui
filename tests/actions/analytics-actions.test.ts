import { describe, it, expect, vi } from 'vitest';
import { listAnalyticsReports, saveAnalyticsReport, deleteAnalyticsReport } from '@/lib/actions/analytics-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('analytics-actions', () => {
  describe('listAnalyticsReports', () => {
    it('should return reports for staff', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'staff-1', role: 'staff' } });
      prismaMock.analyticsReport.findMany.mockResolvedValue([{ report_id: 'r1', title: 'Report' }]);

      const result = await listAnalyticsReports();

      expect(result).toHaveLength(1);
      expect(prismaMock.analyticsReport.findMany).toHaveBeenCalled();
    });

    it('should throw Unauthorized for student', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'student-1', role: 'student' } });
      await expect(listAnalyticsReports()).rejects.toThrow('Unauthorized');
    });
  });

  describe('saveAnalyticsReport', () => {
    const validReport = {
      title: 'New Report',
      definition: {
        version: 1 as const,
        pages: [{
          id: 'p1',
          title: 'Main Page',
          visuals: [{
            id: 'v1',
            type: 'kpi' as const,
            datasetId: 'core_student_metrics' as any,
            layout: { i: 'v1', x: 0, y: 0, w: 2, h: 2 },
          }]
        }]
      }
    };

    it('should create a new report', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'staff-1', role: 'staff' } });
      prismaMock.analyticsReport.create.mockResolvedValue({ report_id: 'new-r' });

      const result = await saveAnalyticsReport(validReport);

      expect(result.reportId).toBe('new-r');
      expect(prismaMock.analyticsReport.create).toHaveBeenCalled();
    });

    it('should update existing report', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'staff-1', role: 'staff' } });
      prismaMock.analyticsReport.updateMany.mockResolvedValue({ count: 1 });

      const result = await saveAnalyticsReport({ ...validReport, reportId: 'r1' });

      expect(result.reportId).toBe('r1');
      expect(prismaMock.analyticsReport.updateMany).toHaveBeenCalled();
    });
  });

  describe('deleteAnalyticsReport', () => {
    it('should delete report', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'staff-1', role: 'staff' } });
      prismaMock.analyticsReport.deleteMany.mockResolvedValue({ count: 1 });

      const result = await deleteAnalyticsReport('r1');

      expect(result.ok).toBe(true);
      expect(prismaMock.analyticsReport.deleteMany).toHaveBeenCalled();
    });
  });
});
