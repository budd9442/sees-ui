'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { generateTwoFactorSecret, verifyTwoFactorCode, generateBackupCodes } from '@/lib/auth/two-factor';
import { revalidatePath } from 'next/cache';

/**
 * @swagger
 * /action/auth/getTwoFactorStatus:
 *   post:
 *     summary: "[Server Action] Check 2FA Status"
 *     description: Returns whether the currently authenticated user has Two-Factor Authentication enabled.
 *     tags:
 *       - Auth Actions
 *     responses:
 *       200:
 *         description: Successfully fetched 2FA status
 */
export async function getTwoFactorStatus() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const user = await prisma.user.findUnique({
        where: { user_id: session.user.id },
        select: { isTwoFactorEnabled: true }
    });

    return user?.isTwoFactorEnabled || false;
}

/**
 * @swagger
 * /action/auth/initiateTwoFactorSetup:
 *   post:
 *     summary: "[Server Action] Start 2FA Setup"
 *     description: Generates a new TOTP secret and QR code for the user to scan with an authenticator app.
 *     tags:
 *       - Auth Actions
 *     responses:
 *       200:
 *         description: Successfully generated secret
 */
export async function initiateTwoFactorSetup() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const { secret, qrCodeUrl } = await generateTwoFactorSecret(session.user.email!);
    
    return { secret, qrCodeUrl };
}

export async function confirmTwoFactorSetup(code: string, secret: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const isValid = await verifyTwoFactorCode(code, secret);
    if (!isValid) return { success: false, error: 'Invalid verification code' };

    const backupCodes = generateBackupCodes();

    await prisma.user.update({
        where: { user_id: session.user.id },
        data: {
            isTwoFactorEnabled: true,
            twoFactorSecret: secret,
            twoFactorBackupCodes: backupCodes
        }
    });

    revalidatePath('/dashboard/profile');

    return { success: true, backupCodes };
}

export async function disableTwoFactor() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    await prisma.user.update({
        where: { user_id: session.user.id },
        data: {
            isTwoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorBackupCodes: []
        }
    });

    revalidatePath('/dashboard/profile');

    return { success: true };
}
