'use server';

import { prisma } from '@/lib/db';
import { parse } from 'csv-parse/sync';

export interface ValidationResult {
    isValid: boolean;
    errors: { row: number, message: string, field: string }[];
    summary: { total: number, valid: number, invalid: number };
}

/**
 * Pre-validate Enrollment CSV (Production Integrity)
 */
export async function validateEnrollmentCSV(csvContent: string): Promise<ValidationResult> {
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    const errors: { row: number, message: string, field: string }[] = [];
    const emails = new Set<string>();

    for (let i = 0; i < records.length; i++) {
        const record = records[i] as any;
        const rowNum = i + 1;

        // 1. Basic Format Validation
        if (!record.email || !record.email.includes('@')) {
            errors.push({ row: rowNum, field: 'email', message: 'Invalid or missing email format.' });
        }
        if (!record.first_name || record.first_name.length < 2) {
            errors.push({ row: rowNum, field: 'first_name', message: 'First name is too short or missing.' });
        }

        // 2. Duplicate Check within CSV
        if (emails.has(record.email)) {
            errors.push({ row: rowNum, field: 'email', message: 'Duplicate email found within the same CSV.' });
        }
        if (record.email) emails.add(record.email);

        // 3. Duplicate Check against DB
        const existingUser = await prisma.user.findUnique({ where: { email: record.email } });
        if (existingUser) {
            errors.push({ row: rowNum, field: 'email', message: `User with email ${record.email} already exists in the system.` });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        summary: {
            total: records.length,
            valid: records.length - errors.length,
            invalid: errors.length
        }
    };
}
