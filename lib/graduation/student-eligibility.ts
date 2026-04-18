import { prisma } from '@/lib/db';
import {
    evaluateGraduationRules,
    ephemeralRulesFromThresholds,
    type EligibilityEvaluationResult,
} from './evaluate-eligibility';

/**
 * ## Academic class / division — canonical server path
 *
 * **Authoritative pipeline (use this when you have a `studentId`):**
 * 1. Load `Student` + `degree_path.graduation_eligibility_profile` (JSON rules), released `Grade`s
 *    (with `module`, `semester`), and `ProgramStructure` for `degree_path_id`.
 * 2. If **no profile** → build rules from `SystemSetting` keys `threshold_first_class`,
 *    `threshold_second_upper`, `threshold_second_lower`, `threshold_third_class` (defaults 3.7 /
 *    3.3 / 3.0 / 2.5) via `ephemeralRulesFromThresholds`.
 * 3. **`evaluateGraduationRules`** (`./evaluate-eligibility.ts`) — weighted GPA over GPA-counting
 *    modules, best released grade per module; walk `evaluationOrder` divisions; first division
 *    where **all** conditions pass wins; `academicClass` from `academicClassFromDivision`.
 * 4. If there are **no released grades** → GPA 0, class **`Unassigned`** (short-circuit before rules).
 *
 * **Call graph (server):**
 * - `AcademicEngine.calculateStudentGPA` → here → used by e.g. `lib/actions/student-actions.ts`
 *   (student dashboard payload with `academicClass`).
 * - `attachEligibilityToStudents` in `lib/actions/hod-actions.ts` → here → HoD **eligible**,
 *   **rankings**, **reports** lists get `academicClass` + evaluator-aligned `currentGPA`.
 * - `previewGraduationEligibility` in `lib/actions/graduation-eligibility-actions.ts` → here →
 *   HoD **graduation-rules** preview.
 *
 * **Persistence & admin overlap:**
 * - Programme rules: `GraduationEligibilityProfile` (HoD `/dashboard/hod/graduation-rules`).
 * - HoD save of a **pure four-`min_gpa`** profile also syncs `threshold_*` + `gpa_academic_class_thresholds`
 *   (`graduation-eligibility-actions.ts`) so older readers stay aligned.
 * - Admin **GPA config** (`getAdminGpaConfigData` / `gpa-client.tsx`) still edits `gpa_academic_class_thresholds`;
 *   live class for a student still comes from profile or `threshold_*` through this file.
 *
 * **GPA-only helpers (no programme rules, no DB):** for UI that only has a GPA number.
 * - `getAcademicClass` in `lib/gpa-utils.ts` (default ladder or custom thresholds object).
 * - `academicClassCalculations.determineAcademicClass` in `lib/calculations.ts` → delegates to `getAcademicClass`.
 *
 * **Client / fallback ladders (should match defaults when server field missing):**
 * - `app/dashboard/hod/eligible/_components/eligible-client.tsx` — prefers `student.academicClass`
 *   from server; else recomputes from props `grades` using 3.7 / 3.3 / 3.0 / 2.5.
 * - `app/dashboard/hod/reports/_components/reports-client.tsx` — same preference + fallback ladder.
 * - `app/dashboard/advisor/.../student-detail-client.tsx`, `records-client.tsx` — `getAcademicClass(local GPA)`.
 * - `app/dashboard/admin/config/gpa/_components/gpa-client.tsx` — sample class from `getAcademicClass`
 *   with **admin-edited** threshold state (preview only).
 *
 * **Display / copy only (not evaluation):** tab descriptions in eligible-client, certificate counts
 * in `rankings-client.tsx` (GPA band filters), `InterventionModal`, `types/index.ts` `AcademicClass`,
 * `student/goals`, `app/api/chat/route.ts` text — keep in sync manually or drive from shared constants.
 *
 * **Stored field:** `Student.academic_class` / `student-subactions` may expose DB column — can lag
 * behind live `evaluateStudentEligibility` unless updated whenever grades change.
 */
export async function evaluateStudentEligibility(studentId: string): Promise<EligibilityEvaluationResult> {
    const student = await prisma.student.findUnique({
        where: { student_id: studentId },
        include: {
            degree_path: {
                include: { graduation_eligibility_profile: true },
            },
        },
    });

    if (!student) {
        return {
            gpa: 0,
            totalGpaCredits: 0,
            matchedDivisionId: null,
            matchedLabel: 'Pass',
            academicClass: 'Pass',
            divisionEvaluations: [],
        };
    }

    const [grades, structureRows, settings] = await Promise.all([
        prisma.grade.findMany({
            where: {
                student_id: studentId,
                released_at: { not: null },
            },
            include: {
                module: true,
                semester: true,
            },
        }),
        prisma.programStructure.findMany({
            where: { program_id: student.degree_path_id },
            select: {
                module_id: true,
                module_type: true,
                specialization_id: true,
                credits: true,
            },
        }),
        prisma.systemSetting.findMany({
            where: {
                key: {
                    in: [
                        'threshold_first_class',
                        'threshold_second_upper',
                        'threshold_second_lower',
                        'threshold_third_class',
                    ],
                },
            },
        }),
    ]);

    if (grades.length === 0) {
        return {
            gpa: 0,
            totalGpaCredits: 0,
            matchedDivisionId: null,
            matchedLabel: '',
            academicClass: 'Unassigned',
            divisionEvaluations: [],
        };
    }

    const gradeInput = grades.map((g) => ({
        module_id: g.module_id,
        grade_point: g.grade_point,
        released_at: g.released_at,
        module: {
            credits: g.module.credits,
            counts_toward_gpa: g.module.counts_toward_gpa,
        },
        semester: { academic_year_id: g.semester.academic_year_id },
    }));

    const structure = structureRows.map((s) => ({
        module_id: s.module_id,
        module_type: s.module_type,
        specialization_id: s.specialization_id,
        credits: s.credits,
    }));

    const profileRules = student.degree_path.graduation_eligibility_profile?.rules;
    let rules: unknown = profileRules;

    if (rules == null) {
        const first = parseFloat(settings.find((s) => s.key === 'threshold_first_class')?.value || '3.7');
        const upper = parseFloat(settings.find((s) => s.key === 'threshold_second_upper')?.value || '3.3');
        const lower = parseFloat(settings.find((s) => s.key === 'threshold_second_lower')?.value || '3.0');
        const third = parseFloat(settings.find((s) => s.key === 'threshold_third_class')?.value || '2.5');
        rules = ephemeralRulesFromThresholds(first, upper, lower, third);
    }

    return evaluateGraduationRules(rules, {
        grades: gradeInput,
        programStructure: structure,
        programId: student.degree_path_id,
        studentSpecializationId: student.specialization_id,
        admissionYear: student.admission_year,
    });
}
