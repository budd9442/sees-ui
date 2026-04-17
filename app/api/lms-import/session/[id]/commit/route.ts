import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getEffectiveGradingBandsForModule } from '@/lib/grading/module-bands';
import { resolveLmsLetterToGradePoint } from '@/lib/lms/lms-letter-to-grade-point';

export const dynamic = 'force-dynamic';

function normalizeGradeLetter(input: string) {
    return String(input ?? '').trim();
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const studentId = session.user.id as string;

    const importSession = await prisma.lmsImportSession.findUnique({
        where: { session_id: id },
        select: { session_id: true, student_id: true, status: true, preview_json: true, error_message: true },
    });

    if (!importSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (importSession.student_id !== studentId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (importSession.status !== 'PREVIEW_READY' || !importSession.preview_json) {
        return NextResponse.json({ error: 'Preview not ready' }, { status: 409 });
    }

    const preview = importSession.preview_json as any;
    const inferred = preview?.inferred ?? {};
    const registrations = (preview?.registrations ?? []) as Array<{
        module_id: string;
        semester_id: string;
        attempt_no: number;
        grade_letter: string | null;
        lms_year: number;
    }>;

    if (!registrations.length) {
        return NextResponse.json({ error: 'No modules matched to import.' }, { status: 400 });
    }

    const semesterIds = [...new Set(registrations.map((r) => r.semester_id))];
    const moduleIds = [...new Set(registrations.map((r) => r.module_id))];

    try {
        await prisma.$transaction(async (tx) => {
            const existing = await tx.moduleRegistration.findMany({
                where: {
                    student_id: studentId,
                    semester_id: { in: semesterIds },
                    module_id: { in: moduleIds },
                },
                select: { reg_id: true },
            });

            const existingRegIds = existing.map((e) => e.reg_id);
            if (existingRegIds.length) {
                // Delete grades first (Grade references ModuleRegistration by reg_id).
                await tx.grade.deleteMany({ where: { reg_id: { in: existingRegIds } } });
                await tx.moduleRegistration.deleteMany({ where: { reg_id: { in: existingRegIds } } });
            }

            // Create registrations + released grades.
            for (const r of registrations) {
                const created = await tx.moduleRegistration.create({
                    data: {
                        student_id: studentId,
                        module_id: r.module_id,
                        semester_id: r.semester_id,
                        status: 'REGISTERED',
                    },
                    select: { reg_id: true },
                });

                const gradeLetter = r.grade_letter ? normalizeGradeLetter(r.grade_letter) : null;

                if (gradeLetter) {
                    const isPass = gradeLetter.toLowerCase() === 'pass';
                    const letter_grade = isPass ? 'Pass' : gradeLetter;

                    if (!isPass) {
                        const bands = await getEffectiveGradingBandsForModule(r.module_id);
                        const resolved = resolveLmsLetterToGradePoint({ letterInput: letter_grade, bands });
                        const grade_point = resolved.grade_point;

                        await tx.grade.create({
                            data: {
                                reg_id: created.reg_id,
                                student_id: studentId,
                                module_id: r.module_id,
                                semester_id: r.semester_id,
                                marks: null,
                                grade_point,
                                letter_grade: resolved.letter_grade,
                                attempt_no: Math.max(1, Number(r.attempt_no) || 1),
                                released_at: new Date(),
                            },
                        });
                        continue;
                    }

                    // Pass doesn't participate in bands; always 0 points.
                    await tx.grade.create({
                        data: {
                            reg_id: created.reg_id,
                            student_id: studentId,
                            module_id: r.module_id,
                            semester_id: r.semester_id,
                            marks: null,
                            grade_point: 0,
                            letter_grade: 'Pass',
                            attempt_no: Math.max(1, Number(r.attempt_no) || 1),
                            released_at: new Date(),
                        },
                    });
                }
            }

            // Update student's academic context after import.
            const currentLevel = inferred.current_level ?? null;
            const pathwayProgramId = inferred.pathway_program_id ?? null;
            const specializationId = inferred.specialization_id ?? null;

            const metadata = (await tx.student.findUnique({
                where: { student_id: studentId },
                select: { metadata: true },
            }))?.metadata as any;

            await tx.student.update({
                where: { student_id: studentId },
                data: {
                    current_level: currentLevel,
                    ...(pathwayProgramId ? { degree_path_id: pathwayProgramId } : {}),
                    ...(currentLevel === 'Level 3' || currentLevel === 'Level 4' ? { specialization_id: specializationId } : {}),
                    metadata: {
                        ...(metadata ?? {}),
                        lms_import_completed_at: new Date().toISOString(),
                        lms_import_completed: true,
                        lms_import_last_session_id: id,
                    },
                },
            });

            await tx.lmsImportSession.update({
                where: { session_id: id },
                data: { status: 'COMMITTED', stage: 'READY', progress_pct: 100, error_message: null },
            });
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Commit failed' }, { status: 500 });
    }
}

