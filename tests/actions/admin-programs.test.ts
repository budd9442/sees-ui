import { describe, it, expect, vi } from 'vitest';
import { getAllPrograms, createProgram, updateProgram, createSpecialization } from '@/lib/actions/admin-programs';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('admin-programs-actions', () => {
  describe('getAllPrograms', () => {
    it('should return programs for admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.degreeProgram.findMany.mockResolvedValue([{ program_id: 'p1', code: 'CS' }]);

      const result = await getAllPrograms();

      expect(result).toHaveLength(1);
    });
  });

  describe('createProgram', () => {
    it('should create new program', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.academicYear.findFirst.mockResolvedValue({ academic_year_id: 'y1' });
      prismaMock.degreeProgram.create.mockResolvedValue({ program_id: 'new-p' });
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await createProgram({
        code: 'CS',
        name: 'Computer Science',
        academicYearId: 'y1'
      });

      expect(result.programId).toBe('new-p');
      expect(prismaMock.degreeProgram.create).toHaveBeenCalled();
    });
  });

  describe('updateProgram', () => {
    it('should update existing program', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
        prismaMock.degreeProgram.update.mockResolvedValue({ program_id: 'p1' });
        prismaMock.auditLog.create.mockResolvedValue({});
  
        await updateProgram('p1', {
          code: 'CS-Updated',
          name: 'Computer Science'
        });
  
        expect(prismaMock.degreeProgram.update).toHaveBeenCalled();
      });
  });

  describe('createSpecialization', () => {
    it('should create new specialization', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.specialization.create.mockResolvedValue({ specialization_id: 'new-s' });
      prismaMock.auditLog.create.mockResolvedValue({});

      await createSpecialization({
        code: 'AI',
        name: 'Artificial Intelligence',
        programId: 'p1'
      });

      expect(prismaMock.specialization.create).toHaveBeenCalled();
    });
  });
});
