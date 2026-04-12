import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email/brevo';
import { getPasswordResetEmail } from '@/lib/email/templates';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Request a password reset
 * POST /api/auth/request-reset
 * Body: { email: string }
 */
export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                user_id: true,
                email: true,
                firstName: true
            }
        });

        // Always return success (don't reveal if email exists)
        // This prevents email enumeration attacks
        if (!user) {
            console.log(`[Password Reset] Email not found: ${email}`);
            return NextResponse.json({
                success: true,
                message: 'If the email exists, a reset link has been sent'
            });
        }

        // Generate secure random token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Delete any existing unused tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: {
                user_id: user.user_id,
                used: false
            }
        });

        // Create new reset token
        await prisma.passwordResetToken.create({
            data: {
                user_id: user.user_id,
                token,
                expires_at: expiresAt
            }
        });

        // Send reset email
        try {
            const emailTemplate = getPasswordResetEmail(user.firstName || 'User', token);
            await sendEmail({
                to: user.email,
                toName: user.firstName || undefined,
                subject: emailTemplate.subject,
                htmlContent: emailTemplate.htmlContent
            });

            console.log(`[Password Reset] Reset email sent to ${user.email}`);
        } catch (emailError) {
            console.error('[Password Reset] Failed to send email:', emailError);
            // Don't fail the request if email fails
            // Token is still created and can be used
        }

        return NextResponse.json({
            success: true,
            message: 'If the email exists, a reset link has been sent'
        });
    } catch (error) {
        console.error('[Password Reset] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process password reset request' },
            { status: 500 }
        );
    }
}
