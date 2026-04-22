import { describe, it, expect, vi } from 'vitest';
import { getTwoFactorStatus, initiateTwoFactorSetup, confirmTwoFactorSetup, disableTwoFactor } from '@/lib/actions/two-factor-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import * as tf from '@/lib/auth/two-factor';

const prismaMock = prisma as any;

// Mock the 2FA library
vi.mock('@/lib/auth/two-factor', () => ({
  generateTwoFactorSecret: vi.fn(),
  verifyTwoFactorCode: vi.fn(),
  generateBackupCodes: vi.fn(),
}));

describe('two-factor-actions', () => {
  describe('getTwoFactorStatus', () => {
    it('should return 2FA status from user record', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      prismaMock.user.findUnique.mockResolvedValue({ isTwoFactorEnabled: true });
      const result = await getTwoFactorStatus();
      expect(result).toBe(true);
    });
  });

  describe('initiateTwoFactorSetup', () => {
    it('should generate secret and QR code', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1', email: 'u1@ex.com' } });
      (tf.generateTwoFactorSecret as any).mockResolvedValue({ secret: 'S1', qrCodeUrl: 'Q1' });

      const result = await initiateTwoFactorSetup();

      expect(result.secret).toBe('S1');
      expect(result.qrCodeUrl).toBe('Q1');
    });
  });

  describe('confirmTwoFactorSetup', () => {
    it('should enable 2FA if code is valid', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      (tf.verifyTwoFactorCode as any).mockResolvedValue(true);
      (tf.generateBackupCodes as any).mockReturnValue(['B1']);
      prismaMock.user.update.mockResolvedValue({});

      const result = await confirmTwoFactorSetup('123456', 'S1');

      expect(result.success).toBe(true);
      expect(result.backupCodes).toEqual(['B1']);
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ isTwoFactorEnabled: true })
      }));
    });

    it('should return error if code is invalid', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      (tf.verifyTwoFactorCode as any).mockResolvedValue(false);
      const result = await confirmTwoFactorSetup('000000', 'S1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid verification code');
    });
  });

  describe('disableTwoFactor', () => {
    it('should disable 2FA for user', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } });
      prismaMock.user.update.mockResolvedValue({});
      const result = await disableTwoFactor();
      expect(result.success).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ isTwoFactorEnabled: false })
      }));
    });
  });
});
