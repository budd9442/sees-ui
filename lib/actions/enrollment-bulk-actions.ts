'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { parse } from 'csv-parse/sync';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email/brevo';

/**
 * Upload and Initial Parse of Bulk Enrollment CSV
 */
export async function uploadBulkEnrollment(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
        throw new Error("Unauthorized: Admin access required.");
    }

    const file = formData.get('file') as File;
    if (!file) throw new Error("No file uploaded.");

    const csvContent = await file.text();
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    // 1. Create Batch Entry
    const batch = await prisma.bulkEnrollmentBatch.create({
        data: {
            uploaded_by: session.user.id,
            filename: file.name,
            total_records: records.length,
            status: 'PENDING'
        }
    });

    // 2. Create Raw Records
    await prisma.bulkEnrollmentRecord.createMany({
        data: records.map((r: any) => ({
            batch_id: batch.batch_id,
            email: r.email,
            first_name: r.first_name,
            last_name: r.last_name,
            status: 'PENDING'
        }))
    });

    revalidatePath('/dashboard/admin/enrollment');
    return { success: true, batchId: batch.batch_id };
}

/**
 * Process a Batch: Create Users, Students, and Dispatch Invites
 */
export async function processEnrollmentBatch(batchId: string) {
    const batch = await prisma.bulkEnrollmentBatch.findUnique({
        where: { batch_id: batchId },
        include: { records: true }
    });

    if (!batch || batch.status === 'COMPLETED') return { success: false, message: "Invalid batch state." };

    await prisma.bulkEnrollmentBatch.update({
        where: { batch_id: batchId },
        data: { status: 'PROCESSING' }
    });

    let successCount = 0;
    let failCount = 0;

    for (const record of batch.records) {
        try {
            await prisma.$transaction(async (tx) => {
                // 1. Check for Duplicate
                const existing = await tx.user.findUnique({ where: { email: record.email } });
                if (existing) throw new Error(`User with email ${record.email} already exists.`);

                // 2. Create User (Pending Setup)
                const user = await tx.user.create({
                    data: {
                        email: record.email,
                        username: record.email.split('@')[0] + Math.floor(Math.random() * 1000), // Random username fallback
                        password_hash: 'PENDING_INVITE', // Placeholder
                        first_name: record.first_name,
                        last_name: record.last_name,
                        status: 'PENDING_SETUP'
                    }
                });

                // 3. Create Student Profile
                const mit = await tx.degreeProgram.findFirst({ where: { code: 'MIT' } });
                await tx.student.create({
                    data: {
                        student_id: user.user_id,
                        admission_year: 2024,
                        degree_path_id: mit?.program_id || 'DEFAULT_PATH_ID',
                        enrollment_status: 'ENROLLED',
                        current_level: 'Level 1'
                    }
                });

                // 4. Generate Registration Token
                const token = crypto.randomBytes(32).toString('hex');
                await tx.registrationToken.create({
                    data: {
                        user_id: user.user_id,
                        token: token,
                        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                    }
                });

                // 5. Update Bulk Record
                await tx.bulkEnrollmentRecord.update({
                    where: { record_id: record.record_id },
                    data: { status: 'SUCCESS', user_id: user.user_id }
                });
                
                successCount++;
            });
        } catch (error: any) {
            failCount++;
            await prisma.bulkEnrollmentRecord.update({
                where: { record_id: record.record_id },
                data: { status: 'FAILED', error_message: error.message }
            });
        }
    }

    await prisma.bulkEnrollmentBatch.update({
        where: { batch_id: batchId },
        data: {
            status: 'COMPLETED',
            successful_records: successCount,
            failed_records: failCount
        }
    });

    revalidatePath('/dashboard/admin/enrollment');
    return { success: true, successCount, failCount };
}

/**
 * Dispatch Emails for a Batch
 */
export async function dispatchEnrollmentInvites(batchId: string) {
    const records = await prisma.bulkEnrollmentRecord.findMany({
        where: { batch_id: batchId, status: 'SUCCESS', email_sent: false },
        include: { batch: true }
    });

    for (const record of records) {
        const tokenData = await prisma.registrationToken.findFirst({
            where: { user_id: record.user_id as string, used: false }
        });

        if (tokenData) {
            const setupLink = `${process.env.NEXTAUTH_URL}/auth/setup-password?token=${tokenData.token}`;
            
            try {
                await sendEmail({
                    to: record.email,
                    toName: `${record.first_name} ${record.last_name}`,
                    subject: "Welcome to SEES! Setup your academic account",
                    htmlContent: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                            <h1 style="color: #1e3a8a;">Welcome to SEES Platform</h1>
                            <p>Hi ${record.first_name},</p>
                            <p>An academic account has been created for you at SEES. Please click the button below to set your password and activate your profile.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${setupLink}" style="display: inline-block; padding: 14px 28px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Setup My Account</a>
                            </div>
                            <p style="color: #64748b; font-size: 0.875rem;">This link will expire in 7 days. If you did not expect this email, please ignore it.</p>
                        </div>
                    `
                });

                await prisma.bulkEnrollmentRecord.update({
                    where: { record_id: record.record_id },
                    data: { email_sent: true, email_sent_at: new Date() }
                });
            } catch (err) {
                console.error(`Failed to send invite to ${record.email}`, err);
            }
        }
    }

    revalidatePath('/dashboard/admin/enrollment');
    return { success: true };
}

/**
 * Complete Account Setup: Set Password and Activate
 */
export async function completeStudentSetup(token: string, password: string) {
    const tokenData = await prisma.registrationToken.findUnique({
        where: { token },
        include: { user: true }
    });

    if (!tokenData || tokenData.used || tokenData.expires_at < new Date()) {
        throw new Error("Invalid or expired setup token.");
    }

    const { hash } = await import('bcryptjs');
    const hashedPassword = await hash(password, 10);

    await prisma.$transaction(async (tx) => {
        // 1. Update User
        await tx.user.update({
            where: { user_id: tokenData.user_id },
            data: {
                password_hash: hashedPassword,
                status: 'ACTIVE'
            }
        });

        // 2. Mark Token as Used
        await tx.registrationToken.update({
            where: { id: tokenData.id },
            data: {
                used: true,
                used_at: new Date()
            }
        });
    });

    return { success: true };
}

/**
 * Fetch Batches for the dashboard
 */
export async function getBulkEnrollmentBatches() {
    return await prisma.bulkEnrollmentBatch.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            records: {
                take: 5 // Sample for preview
            }
        }
    });
}
