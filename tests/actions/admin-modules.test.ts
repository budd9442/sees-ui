import { describe, it, expect, vi } from 'vitest';
import { getModules, upsertModule, deleteModule } from '@/lib/actions/admin-modules';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('admin-modules-actions', () => {
  describe('getModules', () => {
    it('should return modules for admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.academicYear.findFirst.mockResolvedValue({ academic_year_id: 'y1' });
      prismaMock.module.findMany.mockResolvedValue([{ module_id: 'm1', code: 'CS101' }]);

      const result = await getModules();

      expect(result).toHaveLength(1);
      expect(prismaMock.module.findMany).toHaveBeenCalled();
    });
  });

  describe('upsertModule', () => {
    it('should create new module', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.academicYear.findFirst.mockResolvedValue({ academic_year_id: 'y1' });
      prismaMock.module.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.module.create.mockResolvedValue({ module_id: 'new-m' });
      prismaMock.module.findMany.mockResolvedValue([]);
      prismaMock.auditLog.create.mockResolvedValue({});

      await upsertModule({
        code: 'CS102',
        name: 'Data Science',
        credits: 10,
        academicYearId: 'y1',
        active: true,
        level: 'L1',
        counts_toward_gpa: true,
        prerequisiteCodes: []
      });

      expect(prismaMock.module.create).toHaveBeenCalled();
    });

    it('should update existing module', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
        prismaMock.module.findUnique.mockResolvedValue({ academic_year_id: 'y1' });
        prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
        prismaMock.module.update.mockResolvedValue({ module_id: 'm1' });
        prismaMock.module.findMany.mockResolvedValue([]);
        prismaMock.auditLog.create.mockResolvedValue({});
  
        await upsertModule({
          moduleId: 'm1',
          code: 'CS101-Updated',
          name: 'Algorithms',
          credits: 15,
          active: true,
          level: 'L1',
          counts_toward_gpa: true,
          prerequisiteCodes: []
        });
  
        expect(prismaMock.module.update).toHaveBeenCalled();
      });
  });

  describe('deleteModule', () => {
    it('should delete module if no registrations', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.moduleRegistration.count.mockResolvedValue(0);
      prismaMock.module.delete.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await deleteModule('m1');

      expect(result.success).toBe(true);
      expect(prismaMock.module.delete).toHaveBeenCalled();
    });

    it('should fail if registrations exist', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
        prismaMock.moduleRegistration.count.mockResolvedValue(5);
  
        const result = await deleteModule('m1');
  
        expect(result.success).toBe(false);
        expect(result.error).toContain('Cannot delete module');
      });
  });
});
