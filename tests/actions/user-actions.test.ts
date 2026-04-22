import { describe, it, expect, vi } from 'vitest';
import { getUsers, createUser, changePassword } from '@/lib/actions/user-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn().mockResolvedValue(true),
    hash: vi.fn().mockResolvedValue('hashed'),
  },
  compare: vi.fn().mockResolvedValue(true),
  hash: vi.fn().mockResolvedValue('hashed'),
}));

const prismaMock = prisma as any;

describe('user-actions', () => {
  describe('getUsers', () => {
    it('should return paginated users', async () => {
      prismaMock.user.findMany.mockResolvedValue([{ user_id: 'u1', firstName: 'John', email: 'john@ex.com' }]);
      prismaMock.user.count.mockResolvedValue(1);

      const result = await getUsers({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('createUser', () => {
    it('should create user and student profile for student role', async () => {
      (auth as any).mockResolvedValue({ user: { role: 'admin' } });
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.user.create.mockResolvedValue({ user_id: 'new-u' });
      prismaMock.degreeProgram.findFirst.mockResolvedValue({ program_id: 'p1' });
      prismaMock.student.create.mockResolvedValue({});
      prismaMock.registrationToken.create.mockResolvedValue({});

      const result = await createUser({
        firstName: 'New',
        lastName: 'User',
        email: 'new@ex.com',
        role: 'student'
      });

      expect(result.success).toBe(true);
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(prismaMock.student.create).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should update password if old one matches', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      prismaMock.user.findUnique.mockResolvedValue({ user_id: 'u1', password_hash: await bcrypt.hash('old-pass', 10) });
      prismaMock.user.update.mockResolvedValue({});

      const result = await changePassword({
        userId: 'u1',
        currentPassword: 'old-pass',
        newPassword: 'ValidP@ssword123',
        confirmPassword: 'ValidP@ssword123'
      });

      expect(result.success).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalled();
    });
  });
});
