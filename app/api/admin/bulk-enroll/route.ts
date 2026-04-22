import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { generateTempPassword } from '@/lib/email/templates';
import { dispatchNotificationEmail } from '@/lib/notifications/dispatch';
import { NotificationEventKey } from '@/lib/notifications/events';
import { parse } from 'csv-parse/sync';
import { auth } from '@/auth';
import { writeAuditLog } from '@/lib/audit/write-audit-log';

/**
 * @swagger
 * /api/admin/bulk-enroll:
 *   post:
 *     summary: Bulk enroll students
 *     description: Processes a list of students for enrollment via JSON or CSV file.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *               programId:
 *                 type: string
 *               level:
 *                 type: string
 *               filename:
 *                 type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               programId:
 *                 type: string
 *               level:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully processed enrollment
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let records: any[] = [];
        let filename = 'unknown.csv';
        let programId: string;
        let level: string;

        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            const body = await req.json();
            records = body.records.filter((r: any) => r.status !== 'INVALID');
            programId = body.programId;
            level = body.level;
            filename = body.filename || 'manual_entry.csv';
        } else {
            const formData = await req.formData();
            const file = formData.get('file') as File;
            programId = formData.get('programId') as string;
            level = formData.get('level') as string;

            if (!file) {
                return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
            }
            filename = file.name;

            const buffer = Buffer.from(await file.arrayBuffer());
            const content = buffer.toString();

            records = parse(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                bom: true,
            }).filter((r: any) => r.email && (r.firstName || r.lastName));
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
                filename: filename,
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
                        firstName: firstName || '',
                        lastName: lastName || '',
                        status: 'FAILED',
                        error_message: 'Missing required fields'
                    }
                });
                continue;
            }

            try {
                // Use custom identifiers provided via interactive UI, with fallbacks
                const finalStudentId = record.studentId || record.email.split('@')[0].toUpperCase();
                const finalUsername = (record.username || email.split('@')[0]).toLowerCase();
                const tempPassword = generateTempPassword();
                const passwordHash = await hash(tempPassword, 10);

                const user = await prisma.$transaction(async (tx) => {
                    // Final safety check for existing user (check both email and studentId)
                    const existingEmail = await tx.user.findUnique({ where: { email: email.toLowerCase() } });
                    if (existingEmail) throw new Error("Account already exists.");

                    const existingId = await tx.user.findUnique({ where: { user_id: finalStudentId } });
                    if (existingId) throw new Error(`Student ID ${finalStudentId} is already in use.`);

                    const newUser = await tx.user.create({
                        data: {
                            user_id: finalStudentId, // Using institutional ID as the PK
                            email: email.toLowerCase(),
                            username: finalUsername,
                            firstName: firstName,
                            lastName: lastName,
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
                    const loginBase = process.env.NEXT_PUBLIC_APP_URL || 'https://sees.budd.codes';
                    const loginUrl = `${loginBase.replace(/\/$/, '')}/login`;
                    const dispatch = await dispatchNotificationEmail({
                        eventKey: NotificationEventKey.ENROLLMENT_WELCOME,
                        dedupeKey: `${NotificationEventKey.ENROLLMENT_WELCOME}:${user.user_id}`,
                        to: email,
                        toName: `${firstName} ${lastName}`.trim(),
                        recipientUserId: user.user_id,
                        entityType: 'user',
                        entityId: user.user_id,
                        vars: {
                            firstName,
                            username: finalUsername,
                            tempPassword,
                            loginUrl,
                        },
                    });
                    if (dispatch.ok && !('skipped' in dispatch && dispatch.skipped)) {
                        emailSent = true;
                        emailSentAt = new Date();
                    } else if (!dispatch.ok) {
                        console.error(`Failed to send email to ${email}:`, dispatch.error);
                    }
                } catch (emailError) {
                    console.error(`Failed to send email to ${email}:`, emailError);
                }

                // Create success record entry
                await prisma.bulkEnrollmentRecord.create({
                    data: {
                        batch_id: batch.batch_id,
                        email: email,
                        firstName: firstName,
                        lastName: lastName,
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
                        firstName: firstName,
                        lastName: lastName,
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

        const uid = (session.user as { id?: string }).id;
        if (uid) {
            await writeAuditLog({
                adminId: uid,
                action: 'ADMIN_BULK_ENROLL_API_COMPLETE',
                entityType: 'BULK_ENROLLMENT_BATCH',
                entityId: batch.batch_id,
                category: 'ADMIN',
                metadata: {
                    success: results.success,
                    failed: results.failed,
                    programId,
                    level,
                    filename,
                },
            });
        }

        return NextResponse.json({
            ...results,
            batchId: batch.batch_id
        });
    } catch (error: any) {
        console.error('Bulk enrollment error:', error);
        return NextResponse.json({ error: 'Failed to process bulk enrollment' }, { status: 500 });
    }
}
