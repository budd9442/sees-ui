'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Fetch all academic credit rules
 */
export async function getAcademicCreditRules() {
    return await prisma.academicCreditRule.findMany({
        orderBy: [
            { level: 'asc' },
            { semester_number: 'asc' }
        ]
    });
}

/**
 * Fetch a specific rule for a context
 */
export async function getCreditRuleForContext(level: string, semesterNumber: number) {
    return await prisma.academicCreditRule.findFirst({
        where: {
            level,
            semester_number: semesterNumber,
            academic_year_id: null,
        },
    });
}

/**
 * Upsert a credit rule
 */
export async function saveCreditRule(data: {
    level: string;
    semester_number: number;
    min_credits: number;
    max_credits: number;
}) {
    const existing = await prisma.academicCreditRule.findFirst({
        where: {
            level: data.level,
            semester_number: data.semester_number,
            academic_year_id: null,
        },
    });

    const res = existing
        ? await prisma.academicCreditRule.update({
              where: { id: existing.id },
              data: {
                  min_credits: data.min_credits,
                  max_credits: data.max_credits,
              },
          })
        : await prisma.academicCreditRule.create({
              data: {
                  level: data.level,
                  semester_number: data.semester_number,
                  academic_year_id: null,
                  min_credits: data.min_credits,
                  max_credits: data.max_credits,
              },
          });

    revalidatePath('/dashboard/admin/config/credits');
    return { success: true, rule: res };
}

/**
 * Delete a credit rule
 */
export async function deleteCreditRule(id: string) {
    await prisma.academicCreditRule.delete({
        where: { id }
    });
    revalidatePath('/dashboard/admin/config/credits');
    return { success: true };
}
