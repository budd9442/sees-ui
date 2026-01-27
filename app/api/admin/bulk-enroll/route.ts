import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { sendEmail } from '@/lib/email/brevo';
import { getWelcomeEmail, generateTempPassword } from '@/lib/email/templates';
import { parse } from 'csv-parse/sync';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const programId = formData.get('programId') as string;
        const level = formData.get('level') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!programId || !level) {
            return NextResponse.json({ error: 'Program and level are required' }, { status: 400 });
        }

        // Validate program exists
        const program = await prisma.degreeProgram.findUnique({
            where: { program_id: programId, active: true }
        });

        if (!program) {
            return NextResponse.json({ error: 'Invalid program selected' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const content = buffer.toString();

        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        // Calculate admission year based on level
        const currentYear = new Date().getFullYear();
        let admissionYear = currentYear;

        switch (level) {
            case 'L1':
                admissionYear = currentYear - 2;
                break;
            case 'L2':
                admissionYear = currentYear - 3;
                break;
            case 'L3':
                admissionYear = currentYear - 4;
                break;
            case 'L4':
                admissionYear = currentYear - 5;
                break;
        }

        // Create batch record
        const batch = await prisma.bulkEnrollmentBatch.create({
            data: {
                uploaded_by: (session.user as any).id || session.user.email || 'unknown',
                filename: file.name,
                program_id: programId,
                level: level,
                total_records: records.length,
                status: 'PROCESSING'
            }
        });

        const results = {
            total: records.length,
            success: 0,
            failed: 0,
            errors: [] as { email: string; error: string }[],
        };

        for (const record of records as any[]) {
            const { email, firstName, lastName } = record;

            if (!email || !firstName || !lastName) {
                results.failed++;
                results.errors.push({
                    email: email || 'Unknown',
                    error: 'Missing required fields (email, firstName, lastName)',
                });

                // Create failed record entry
                await prisma.bulkEnrollmentRecord.create({
                    data: {
                        batch_id: batch.batch_id,
                        email: email || 'unknown',
                        first_name: firstName || '',
                        last_name: lastName || '',
                        status: 'FAILED',
                        error_message: 'Missing required fields'
                    }
                });
                continue;
            }

            try {
                // Simplified username generation
                const username = email.split('@')[0];
                const tempPassword = generateTempPassword();
                const passwordHash = await hash(tempPassword, 10);

                const user = await prisma.$transaction(async (tx) => {
                    const newUser = await tx.user.create({
                        data: {
                            email: email.toLowerCase(),
                            username: username.toLowerCase(),
                            first_name: firstName,
                            last_name: lastName,
                            password_hash: passwordHash,
                            status: 'ACTIVE',
                        },
                    });

                    await tx.student.create({
                        data: {
                            student_id: newUser.user_id,
                            admission_year: admissionYear,
                            degree_path_id: programId,
                            enrollment_status: 'ENROLLED',
                            current_level: level,
                        },
                    });

                    return newUser;
                });

                // Send welcome email
                let emailSent = false;
                let emailSentAt = null;

                try {
                    const emailTemplate = getWelcomeEmail(firstName, username, tempPassword);
                    await sendEmail({
                        to: email,
                        toName: firstName,
                        subject: emailTemplate.subject,
                        htmlContent: emailTemplate.htmlContent
                    });
                    emailSent = true;
                    emailSentAt = new Date();
                } catch (emailError) {
                    console.error(`Failed to send email to ${email}:`, emailError);
                }

                // Create success record entry
                await prisma.bulkEnrollmentRecord.create({
                    data: {
                        batch_id: batch.batch_id,
                        email: email,
                        first_name: firstName,
                        last_name: lastName,
                        user_id: user.user_id,
                        status: 'SUCCESS',
                        email_sent: emailSent,
                        email_sent_at: emailSentAt
                    }
                });

                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    email: email,
                    error: error.message,
                });

                // Create failed record entry
                await prisma.bulkEnrollmentRecord.create({
                    data: {
                        batch_id: batch.batch_id,
                        email: email,
                        first_name: firstName,
                        last_name: lastName,
                        status: 'FAILED',
                        error_message: error.message
                    }
                });
            }
        }

        // Update batch with final counts
        await prisma.bulkEnrollmentBatch.update({
            where: { batch_id: batch.batch_id },
            data: {
                successful_records: results.success,
                failed_records: results.failed,
                status: 'COMPLETED'
            }
        });

        return NextResponse.json({
            ...results,
            batchId: batch.batch_id
        });
    } catch (error: any) {
        console.error('Bulk enrollment error:', error);
        return NextResponse.json({ error: 'Failed to process bulk enrollment' }, { status: 500 });
    }
}
