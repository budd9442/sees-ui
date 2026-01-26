import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * Reset password using token
 * POST /api/auth/reset-password
 * Body: { token: string, password: string }
 */
export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Find token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!resetToken) {
            return NextResponse.json(
                { error: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (new Date() > resetToken.expires_at) {
            return NextResponse.json(
                { error: 'Reset token has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Check if token has been used
        if (resetToken.used) {
            return NextResponse.json(
                { error: 'Reset token has already been used' },
                { status: 400 }
            );
        }

        // Hash new password
        const password_hash = await bcrypt.hash(password, 10);

        // Update user password and mark token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { user_id: resetToken.user_id },
                data: { password_hash }
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: {
                    used: true,
                    used_at: new Date()
                }
            })
        ]);

        console.log(`[Password Reset] Password successfully reset for user ${resetToken.user.email}`);

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        console.error('[Password Reset] Error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 }
        );
    }
}
