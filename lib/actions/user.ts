'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email/brevo';
import { getWelcomeEmail, generateTempPassword } from '@/lib/email/templates';

interface CreateUserParams {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'STAFF' | 'ADMIN';
    sendWelcomeEmail?: boolean;
}

/**
 * Create a new user with optional welcome email
 */
export async function createUserWithEmail(params: CreateUserParams) {
    try {
        const { email, username, firstName, lastName, role, sendWelcomeEmail } = params;

        // Generate temporary password
        const tempPassword = generateTempPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                username: username.toLowerCase(),
                firstName: firstName,
                lastName: lastName,
                password_hash: passwordHash,
                status: 'ACTIVE'
            }
        });

        console.log(`[User Creation] Created user: ${user.email}`);

        // Send welcome email if requested
        if (sendWelcomeEmail) {
            try {
                const emailTemplate = getWelcomeEmail(firstName, username, tempPassword);
                await sendEmail({
                    to: email,
                    toName: firstName,
                    subject: emailTemplate.subject,
                    htmlContent: emailTemplate.htmlContent
                });

                console.log(`[User Creation] Welcome email sent to ${email}`);

                return {
                    success: true,
                    user,
                    emailSent: true,
                    message: `User created and welcome email sent to ${email}`
                };
            } catch (emailError) {
                console.error('[User Creation] Failed to send welcome email:', emailError);

                return {
                    success: true,
                    user,
                    emailSent: false,
                    message: `User created but failed to send welcome email. Temporary password: ${tempPassword}`
                };
            }
        }

        return {
            success: true,
            user,
            emailSent: false,
            tempPassword, // Return temp password if no email sent
            message: `User created successfully. Temporary password: ${tempPassword}`
        };
    } catch (error) {
        console.error('[User Creation] Error:', error);

        if (error instanceof Error) {
            if (error.message.includes('Unique constraint')) {
                return {
                    success: false,
                    error: 'Username or email already exists'
                };
            }
        }

        return {
            success: false,
            error: 'Failed to create user'
        };
    }
}
