import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triggerBackup, cleanupOldBackups } from '@/lib/actions/backup-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

vi.mock('@/auth');
vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findMany: vi.fn() },
    student: { findMany: vi.fn() },
    moduleRegistration: { findMany: vi.fn() },
    grade: { findMany: vi.fn() },
    module: { findMany: vi.fn() },
    systemSetting: { findMany: vi.fn() },
    degreeProgram: { findMany: vi.fn() },
    semester: { findMany: vi.fn() },
  }
}));
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    unlinkSync: vi.fn(),
  }
}));
vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn(),
    createCipheriv: vi.fn(),
  }
}));

const prismaMock = prisma as any;
const fsMock = vi.mocked(fs);
const cryptoMock = vi.mocked(crypto);

describe('backup-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('triggerBackup', () => {
    it('should throw error if not admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1', role: 'student' } });
      await expect(triggerBackup()).rejects.toThrow('Unauthorized: Admin access required.');
    });

    it('should create backup successfully', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin1', role: 'admin' } });
      
      // Mock prisma returns
      prismaMock.user.findMany.mockResolvedValue([{ id: 1 }]);
      prismaMock.student.findMany.mockResolvedValue([]);
      prismaMock.moduleRegistration.findMany.mockResolvedValue([]);
      prismaMock.grade.findMany.mockResolvedValue([]);
      prismaMock.module.findMany.mockResolvedValue([]);
      prismaMock.systemSetting.findMany.mockResolvedValue([]);
      prismaMock.degreeProgram.findMany.mockResolvedValue([]);
      prismaMock.semester.findMany.mockResolvedValue([]);

      // Mock fs
      fsMock.existsSync.mockReturnValue(false);
      fsMock.mkdirSync.mockReturnValue(undefined);
      fsMock.writeFileSync.mockReturnValue(undefined);
      fsMock.readdirSync.mockReturnValue([]);

      // Mock crypto
      cryptoMock.randomBytes.mockReturnValue(Buffer.alloc(16));
      cryptoMock.createCipheriv.mockReturnValue({
        update: vi.fn().mockReturnValue(Buffer.from('encrypted')),
        final: vi.fn().mockReturnValue(Buffer.from('data')),
      } as any);

      const result = await triggerBackup();

      expect(result.success).toBe(true);
      expect(fsMock.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('backups'));
      expect(fsMock.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('cleanupOldBackups', () => {
    it('should remove old files', async () => {
      fsMock.existsSync.mockReturnValue(true);
      fsMock.readdirSync.mockReturnValue(['old.json', 'new.json'] as any);
      
      const now = new Date().getTime();
      const thirtyOneDaysAgo = now - (31 * 24 * 60 * 60 * 1000);
      const oneDayAgo = now - (1 * 24 * 60 * 60 * 1000);

      fsMock.statSync.mockImplementation((p: string) => {
        if (p.includes('old.json')) return { birthtime: new Date(thirtyOneDaysAgo) } as any;
        return { birthtime: new Date(oneDayAgo) } as any;
      });

      await cleanupOldBackups();

      expect(fsMock.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('old.json'));
      expect(fsMock.unlinkSync).not.toHaveBeenCalledWith(expect.stringContaining('new.json'));
    });
  });
});
