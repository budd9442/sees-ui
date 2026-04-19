'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { generateTwoFactorSecret, verifyTwoFactorCode, generateBackupCodes } from '@/lib/auth/two-factor';
import { revalidatePath } from 'next/cache';

export async function getTwoFactorStatus() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const user = await prisma.user.findUnique({
        where: { user_id: session.user.id },
        select: { isTwoFactorEnabled: true }
    });

    return user?.isTwoFactorEnabled || false;
}

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
