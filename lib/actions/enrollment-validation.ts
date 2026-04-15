'use server';

import { prisma } from '@/lib/db';
import { parse } from 'csv-parse/sync';

export interface ValidationResult {
    isValid: boolean;
    records: {
        row: number;
        email: string;
        firstName: string;
        lastName: string;
        username: string;
        studentId: string;
        status: 'READY' | 'DUPLICATE' | 'INVALID';
        message?: string;
    }[];
    errors: { row: number, message: string, field: string }[];
    summary: { total: number, valid: number, invalid: number, duplicates: number };
}

/**
 * Pre-validate Enrollment CSV (Production Integrity)
 */
export async function validateEnrollmentCSV(csvContent: string, prefixOverride?: string): Promise<ValidationResult> {
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    const parsedRecords: ValidationResult['records'] = [];
    const errors: { row: number, message: string, field: string }[] = [];
    const emailsInCsv = new Set<string>();
    let duplicates = 0;

    for (let i = 0; i < records.length; i++) {
        const record = records[i] as any;
        const rowNum = i + 1;
        
        let status: 'READY' | 'DUPLICATE' | 'INVALID' = 'READY';
        let message = '';
        const emailPrefix = record.email ? record.email.split('@')[0] : '';
        const suggestedUsername = record.username || emailPrefix.toLowerCase();
        
        // Student ID Inference: e.g. bandara-im22053 -> IM/2022/053
        let inferredStudentId = record.studentId || '';
        if (!inferredStudentId && emailPrefix) {
            const codeMatch = emailPrefix.match(/([a-z]+)(\d{2})(\d{3})$/i);
            if (codeMatch) {
                const [_, prefix, year, num] = codeMatch;
                const finalPre = prefixOverride || prefix.toUpperCase();
                inferredStudentId = `${finalPre}/20${year}/${num}`;
            } else {
                inferredStudentId = prefixOverride ? `${prefixOverride.toUpperCase()}/${emailPrefix.toUpperCase()}` : emailPrefix.toUpperCase();
            }
        }

        // 1. Basic Format Validation
        if (!record.email || !record.email.includes('@')) {
            status = 'INVALID';
            message = 'Invalid email format';
            errors.push({ row: rowNum, field: 'email', message });
        } else if (!record.firstName || record.firstName.length < 2) {
            status = 'INVALID';
            message = 'First name too short';
            errors.push({ row: rowNum, field: 'firstName', message });
        }

        // 2. Duplicate Check within CSV
        if (status !== 'INVALID') {
            if (emailsInCsv.has(record.email)) {
                status = 'INVALID';
                message = 'Duplicate in CSV';
                errors.push({ row: rowNum, field: 'email', message });
            }
            emailsInCsv.add(record.email);
        }

        parsedRecords.push({
            row: rowNum,
            email: record.email || '',
            firstName: record.firstName || '',
            lastName: record.lastName || '',
            username: suggestedUsername,
            studentId: inferredStudentId,
            status,
            message
        });
    }

    // 3. Bulk Duplicate Check against DB
    const validEmails = parsedRecords.filter(r => r.status === 'READY').map(r => r.email);
    const existingUsers = await prisma.user.findMany({
        where: { email: { in: validEmails } },
        select: { email: true }
    });
    const existingEmails = new Set(existingUsers.map(u => u.email));

    // Update statuses based on bulk check
    for (const record of parsedRecords) {
        if (record.status === 'READY' && existingEmails.has(record.email)) {
            record.status = 'DUPLICATE';
            record.message = 'Already exists in system';
            duplicates++;
        }
    }

    return {
        isValid: errors.filter(e => e.message !== 'Already exists in system').length === 0,
        records: parsedRecords,
        errors,
        summary: {
            total: records.length,
            valid: parsedRecords.filter(r => r.status === 'READY').length,
            invalid: errors.length,
            duplicates
        }
    };
}
