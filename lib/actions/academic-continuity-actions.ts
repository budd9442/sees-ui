'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Deep clones curriculum (ProgramStructure) and teaching assignments from a source year to a target year.
 */
export async function cloneAcademicYearData(sourceYearId: string, targetYearId: string, options: { 
    modules: boolean, 
    staff: boolean 
}) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            let modulesCloned = 0;
            let staffCloned = 0;

            // 1. Clone Curriculum (ProgramStructure)
            if (options.modules) {
                const sourceStructures = await tx.programStructure.findMany({
                    where: { academic_year_id: sourceYearId }
                });

                for (const struct of sourceStructures) {
                    // Check if duplicate already exists in target (idempotency)
                    const existing = await tx.programStructure.findUnique({
                        where: {
                            program_id_specialization_id_module_id_academic_year_id: {
                                program_id: struct.program_id,
                                specialization_id: struct.specialization_id || null as any,
                                module_id: struct.module_id,
                                academic_year_id: targetYearId
                            }
                        }
                    });

                    if (!existing) {
                        await tx.programStructure.create({
                            data: {
                                program_id: struct.program_id,
                                specialization_id: struct.specialization_id,
                                module_id: struct.module_id,
                                semester_id: null, // Semesters are year-specific, will need manual mapping or auto-gen
                                academic_year_id: targetYearId,
                                academic_level: struct.academic_level,
                                semester_number: struct.semester_number,
                                module_type: struct.module_type,
                                credits: struct.credits
                            }
                        });
                        modulesCloned++;
                    }
                }
            }

            // 2. Clone Staff Assignments
            if (options.staff) {
                const sourceAssignments = await tx.staffAssignment.findMany({
                    where: { academic_year_id: sourceYearId }
                });

                for (const assign of sourceAssignments) {
                    const existing = await tx.staffAssignment.findUnique({
                        where: {
                            staff_id_module_id_academic_year_id: {
                                staff_id: assign.staff_id,
                                module_id: assign.module_id || "",
                                academic_year_id: targetYearId
                            }
                        }
                    });

                    if (!existing) {
                        await tx.staffAssignment.create({
                            data: {
                                staff_id: assign.staff_id,
                                program_id: assign.program_id,
                                module_id: assign.module_id,
                                academic_year_id: targetYearId,
                                role: assign.role,
                                active: true
                            }
                        });
                        staffCloned++;
                    }
                }
            }

            return { modulesCloned, staffCloned };
        });

        revalidatePath('/dashboard/admin/config/academic');
        return { success: true, data: result };

    } catch (error: any) {
        console.error("Cloning Failed:", error);
        return { success: false, error: error.message || "Cloning operation failed" };
    }
}
