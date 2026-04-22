import { describe, it, expect, vi } from 'vitest';
import { listModuleRegistrationRounds, createModuleRegistrationRound, getStudentModuleRegistrationWindow } from '@/lib/actions/module-registration-round-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('module-registration-round-actions', () => {
  describe('listModuleRegistrationRounds', () => {
    it('should return rounds for hod', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', role: 'hod' } });
      // The code uses a dynamic property lookup on prisma
      prismaMock.moduleRegistrationRound = {
          findMany: vi.fn().mockResolvedValue([{ round_id: 'r1', label: 'Round 1' }])
      };

      const result = await listModuleRegistrationRounds();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('createModuleRegistrationRound', () => {
    it('should create round with valid dates', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', role: 'hod' } });
      prismaMock.moduleRegistrationRound = {
          create: vi.fn().mockResolvedValue({ round_id: 'new-r' })
      };

      const result = await createModuleRegistrationRound({
        academic_year_id: 'y1',
        label: 'New Round',
        levels: ['L1'],
        opens_at: new Date(Date.now() + 1000),
        closes_at: new Date(Date.now() + 100000)
      });

      expect(result.success).toBe(true);
      expect(prismaMock.moduleRegistrationRound.create).toHaveBeenCalled();
    });
  });

  describe('getStudentModuleRegistrationWindow', () => {
    it('should return window status for student', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1', role: 'student' } });
      prismaMock.academicYear.findFirst.mockResolvedValue({ academic_year_id: 'y1', active: true });
      prismaMock.student.findUnique.mockResolvedValue({ current_level: 'L1' });
      prismaMock.moduleRegistrationRound = {
          findMany: vi.fn().mockResolvedValue([{
              round_id: 'r1',
              label: 'Open Round',
              status: 'OPEN',
              levels: ['L1'],
              opens_at: new Date(Date.now() - 10000),
              closes_at: new Date(Date.now() + 10000)
          }]),
          findFirst: vi.fn()
      };

      const result = await getStudentModuleRegistrationWindow();

      expect(result.windowOk).toBe(true);
      expect(result.canEdit).toBe(true);
    });
  });
});
