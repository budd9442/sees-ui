import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { sendEmail } from '@/lib/email/brevo';
import { getWelcomeEmail, generateTempPassword } from '@/lib/email/templates';
import { parse } from 'csv-parse/sync';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const content = buffer.toString();

        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        const results = {
            total: records.length,
            success: 0,
            failed: 0,
            errors: [] as { email: string; error: string }[],
        };

        for (const record of records as any[]) {
            try {
                const { email, firstName, lastName, role, admissionYear, degreePathId, staffNumber, department, staffType } = record;

                if (!email || !firstName || !lastName || !role) {
                    throw new Error('Missing required fields (email, firstName, lastName, role)');
                }

                // Simplified username generation
                const username = email.split('@')[0];
                const tempPassword = generateTempPassword();
                const passwordHash = await hash(tempPassword, 10);

                await prisma.$transaction(async (tx) => {
                    const user = await tx.user.create({
                        data: {
                            email: email.toLowerCase(),
                            username: username.toLowerCase(),
                            first_name: firstName,
                            last_name: lastName,
                            password_hash: passwordHash,
                            status: 'ACTIVE',
                        },
                    });

                    if (role.toLowerCase() === 'student') {
                        await tx.student.create({
                            data: {
                                student_id: user.user_id,
                                admission_year: parseInt(admissionYear) || new Date().getFullYear(),
                                degree_path_id: degreePathId || '',
                                enrollment_status: 'ENROLLED',
                            },
                        });
                    } else if (role.toLowerCase() === 'staff') {
                        await tx.staff.create({
                            data: {
                                staff_id: user.user_id,
                                staff_number: staffNumber || `STF${Math.floor(Math.random() * 10000)}`,
                                staff_type: staffType || 'ACADEMIC',
                                department: department || 'General',
                            },
                        });
                    }
                });

                // Always send welcome email
                try {
                    const emailTemplate = getWelcomeEmail(firstName, username, tempPassword);
                    await sendEmail({
                        to: email,
                        toName: firstName,
                        subject: emailTemplate.subject,
                        htmlContent: emailTemplate.htmlContent
                    });
                } catch (emailError) {
                    console.error(`Failed to send email to ${email}:`, emailError);
                }

                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    email: record.email || 'Unknown',
                    error: error.message,
                });
            }
        }

        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Bulk enrollment error:', error);
        return NextResponse.json({ error: 'Failed to process bulk enrollment' }, { status: 500 });
    }
}
