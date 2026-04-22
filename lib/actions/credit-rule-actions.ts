'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { writeAuditLog } from '@/lib/audit/write-audit-log';

/**
 * Fetch all academic credit rules
 */
/**
 * @swagger
 * /action/credit-rule/getAcademicCreditRules:
 *   post:
 *     summary: "[Server Action] List Credit Rules"
 *     description: Returns all academic credit rules governing the minimum and maximum credits allowed per semester and study level.
 *     tags:
 *       - Credit Rule Actions
 *     responses:
 *       200:
 *         description: Successfully fetched credit rules
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
/**
 * @swagger
 * /action/credit-rule/saveCreditRule:
 *   post:
 *     summary: "[Server Action] Create or Update Credit Rule"
 *     description: Configures the credit limits for a specific academic level and semester.
 *     tags:
 *       - Credit Rule Actions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: string
 *               semester_number:
 *                 type: number
 *               min_credits:
 *                 type: number
 *               max_credits:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successfully saved credit rule
 */
export async function saveCreditRule(data: {
    level: string;
    semester_number: number;
    min_credits: number;
    max_credits: number;
}) {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
        throw new Error('Unauthorized');
    }

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

    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_CREDIT_RULE_SAVE',
        entityType: 'ACADEMIC_CREDIT_RULE',
        entityId: res.id,
        category: 'ADMIN',
        metadata: { level: data.level, semester: data.semester_number },
    });

    revalidatePath('/dashboard/admin/config/credits');
    return { success: true, rule: res };
}

/**
 * Delete a credit rule
 */
export async function deleteCreditRule(id: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    await prisma.academicCreditRule.delete({
        where: { id }
    });

    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_CREDIT_RULE_DELETE',
        entityType: 'ACADEMIC_CREDIT_RULE',
        entityId: id,
        category: 'ADMIN',
    });

    revalidatePath('/dashboard/admin/config/credits');
    return { success: true };
}
