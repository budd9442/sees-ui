import { prisma } from '@/lib/db';

/**
 * Academic years to use when resolving class lists for a staff assignment.
 * Unions: active year, assignment year, catalog row year, and any years already
 * present on ModuleRegistrations for this module code (handles drift in config).
 */
export async function registrationAcademicYearScope(
    assignmentAcademicYearId: string | null | undefined,
    moduleCatalogAcademicYearId: string | null | undefined,
    moduleCode?: string | null
): Promise<string[]> {
    const ids = new Set<string>();
    const active = await prisma.academicYear.findFirst({
        where: { active: true },
        select: { academic_year_id: true },
    });
    if (active?.academic_year_id) ids.add(active.academic_year_id);
    if (assignmentAcademicYearId) ids.add(assignmentAcademicYearId);
    if (moduleCatalogAcademicYearId) ids.add(moduleCatalogAcademicYearId);

    const code = moduleCode?.trim();
    if (code) {
        const regs = await prisma.moduleRegistration.findMany({
            where: {
                status: { not: 'DROPPED' },
                module: { code: { equals: code, mode: 'insensitive' } },
            },
            select: { semester: { select: { academic_year_id: true } } },
            take: 500,
        });
        for (const r of regs) {
            if (r.semester?.academic_year_id) ids.add(r.semester.academic_year_id);
        }
    }

    return [...ids];
}

/**
 * ModuleRegistrations visible for this staff assignment: same assigned module_id,
 * OR same module code (case-insensitive) in any of the given academic years' semesters.
 */
export function whereRegistrationsForStaffAssignment(opts: {
    assignmentModuleId: string;
    moduleCode: string;
    academicYearIds: string[];
}) {
    const code = opts.moduleCode.trim();
    const base: Record<string, unknown> = {
        status: { not: 'DROPPED' },
        OR: [
            { module_id: opts.assignmentModuleId },
            ...(code.length > 0
                ? [{ module: { code: { equals: code, mode: 'insensitive' as const } } }]
                : []),
        ],
    };
    if (opts.academicYearIds.length > 0) {
        base.semester = { academic_year_id: { in: opts.academicYearIds } };
    }
    return base as any;
}

export async function countRegistrationsForStaffAssignment(opts: {
    assignmentModuleId: string;
    moduleCode: string;
    academicYearIds: string[];
}) {
    return prisma.moduleRegistration.count({
        where: whereRegistrationsForStaffAssignment(opts),
    });
}

export async function countGradesForStaffAssignment(opts: {
    assignmentModuleId: string;
    moduleCode: string;
    academicYearIds: string[];
}) {
    const code = opts.moduleCode.trim();
    if (opts.academicYearIds.length === 0) return 0;
    const semesterIds = (
        await prisma.semester.findMany({
            where: { academic_year_id: { in: opts.academicYearIds } },
            select: { semester_id: true },
        })
    ).map((s) => s.semester_id);
    if (semesterIds.length === 0) return 0;

    return prisma.grade.count({
        where: {
            semester_id: { in: semesterIds },
            OR: [
                { module_id: opts.assignmentModuleId },
                ...(code.length > 0
                    ? [{ module: { code: { equals: code, mode: 'insensitive' as const } } }]
                    : []),
            ],
        },
    });
}
