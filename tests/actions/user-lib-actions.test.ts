import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUserWithEmail } from '@/lib/actions/user';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import * as emailUtils from '@/lib/email/brevo';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { create: vi.fn() },
  }
}));
vi.mock('bcryptjs');
vi.mock('@/lib/email/brevo');

const prismaMock = prisma as any;

describe('user-lib-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUserWithEmail', () => {
    it('should create user and return temp password', async () => {
      (bcrypt.hash as any).mockResolvedValue('hashed_pwd');
      prismaMock.user.create.mockResolvedValue({ user_id: 'u1', email: 'test@ex.com' });

      const result = await createUserWithEmail({
        email: 'test@ex.com',
        username: 'test',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
        sendWelcomeEmail: false
      });

      expect(result.success).toBe(true);
      expect(result.tempPassword).toBeDefined();
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should handle email failure gracefully', async () => {
      (bcrypt.hash as any).mockResolvedValue('hashed_pwd');
      prismaMock.user.create.mockResolvedValue({ user_id: 'u1', email: 'test@ex.com' });
      (emailUtils.sendEmail as any).mockRejectedValue(new Error('Email service down'));

      const result = await createUserWithEmail({
        email: 'test@ex.com',
        username: 'test',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
        sendWelcomeEmail: true
      });

      expect(result.success).toBe(true);
      expect(result.emailSent).toBe(false);
      expect(result.message).toContain('failed to send welcome email');
    });

    it('should return error on unique constraint failure', async () => {
      prismaMock.user.create.mockRejectedValue(new Error('Unique constraint failed'));

      const result = await createUserWithEmail({
        email: 'exists@ex.com',
        username: 'exists',
        firstName: 'E',
        lastName: 'X',
        role: 'STUDENT'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username or email already exists');
    });
  });
});
