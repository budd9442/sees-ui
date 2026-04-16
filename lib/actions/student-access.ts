'use server';

import { prisma } from '@/lib/db';

export async function assertStudentWriteAccess(studentId: string) {
    const student = await prisma.student.findUnique({
        where: { student_id: studentId },
        select: { current_level: true, graduation_status: true },
    });

    if (!student) {
        throw new Error('Student profile not found');
    }

    const isGraduated =
        student.current_level === 'GRADUATED' ||
        student.graduation_status === 'GRADUATED';

    if (isGraduated) {
        throw new Error('Graduate accounts are read-only. Only messaging is allowed.');
    }
}
