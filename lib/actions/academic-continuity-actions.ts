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
            let structuresCloned = 0;
            let staffCloned = 0;
            let programsCloned = 0;
            let specializationsCloned = 0;
            let gradingCloned = 0;
            let creditsCloned = 0;

            const moduleIdMap = new Map<string, string>();
            const programIdMap = new Map<string, string>();
            const specIdMap = new Map<string, string>();

            // 0. Clone Global Configurations (Grading & Credits)
            
            // 0.1 Credit Rules
            const sourceCredits = await tx.academicCreditRule.findMany({
                where: { academic_year_id: sourceYearId === 'none' ? null : sourceYearId }
            });
            for (const rule of sourceCredits) {
                await tx.academicCreditRule.create({
                    data: {
                        level: rule.level,
                        semester_number: rule.semester_number,
                        min_credits: rule.min_credits,
                        max_credits: rule.max_credits,
                        academic_year_id: targetYearId
                    }
                });
                creditsCloned++;
            }

            // 0.2 Grading Schemes
            const sourceGrading = await tx.gradingScheme.findMany({
                where: { academic_year_id: sourceYearId === 'none' ? null : sourceYearId },
                include: { bands: true }
            });
            for (const scheme of sourceGrading) {
                await tx.gradingScheme.create({
                    data: {
                        name: scheme.name,
                        version: scheme.version,
                        active: scheme.active,
                        academic_year_id: targetYearId,
                        bands: {
                            create: scheme.bands.map(b => ({
                                min_marks: b.min_marks,
                                max_marks: b.max_marks,
                                grade_point: b.grade_point,
                                letter_grade: b.letter_grade
                            }))
                        }
                    }
                });
                gradingCloned++;
            }

            // 0.3 Degree Programs
            const sourcePrograms = await tx.degreeProgram.findMany({
                where: { academic_year_id: sourceYearId === 'none' ? null : sourceYearId }
            });
            for (const prog of sourcePrograms) {
                const targetProg = await tx.degreeProgram.create({
                    data: {
                        code: prog.code,
                        name: prog.name,
                        description: prog.description,
                        active: prog.active,
                        is_common: prog.is_common,
                        academic_year_id: targetYearId
                    }
                });
                programIdMap.set(prog.program_id, targetProg.program_id);
                programsCloned++;
            }

            // 0.4 Specializations
            const sourceSpecs = await tx.specialization.findMany({
                where: { academic_year_id: sourceYearId === 'none' ? null : sourceYearId }
            });
            for (const spec of sourceSpecs) {
                const newProgId = programIdMap.get(spec.program_id);
                if (!newProgId) continue;

                const targetSpec = await tx.specialization.create({
                    data: {
                        code: spec.code,
                        name: spec.name,
                        description: spec.description,
                        active: spec.active,
                        academic_year_id: targetYearId,
                        program_id: newProgId
                    }
                });
                specIdMap.set(spec.specialization_id, targetSpec.specialization_id);
                specializationsCloned++;
            }

            // 1. Physically Clone the Module Definitions for the new year
            // This ensures each year has its own independent module snapshot
            const sourceModules = await tx.module.findMany({
                where: { academic_year_id: sourceYearId === 'none' ? null : sourceYearId }
            });

            for (const mod of sourceModules) {
                // Check if already exists in target
                let targetModule = await tx.module.findUnique({
                    where: {
                        code_academic_year_id: {
                            code: mod.code,
                            academic_year_id: targetYearId
                        }
                    }
                });

                if (!targetModule) {
                    targetModule = await tx.module.create({
                        data: {
                            code: mod.code,
                            name: mod.name,
                            credits: mod.credits,
                            level: mod.level,
                            description: mod.description,
                            active: mod.active,
                            academic_year_id: targetYearId
                        }
                    });
                    modulesCloned++;
                }
                
                moduleIdMap.set(mod.module_id, targetModule.module_id);
            }

            // 2. Clone Curriculum (ProgramStructure) using remapped IDs
            if (options.modules) {
                const sourceStructures = await tx.programStructure.findMany({
                    where: { academic_year_id: sourceYearId === 'none' ? null : sourceYearId }
                });

                for (const struct of sourceStructures) {
                    const newModuleId = moduleIdMap.get(struct.module_id);
                    const newProgId = programIdMap.get(struct.program_id);
                    const newSpecId = struct.specialization_id ? specIdMap.get(struct.specialization_id) : null;
                    
                    if (!newModuleId || !newProgId) continue;

                    const existing = await tx.programStructure.findUnique({
                        where: {
                            program_id_specialization_id_module_id_academic_year_id: {
                                program_id: newProgId,
                                specialization_id: newSpecId || null as any,
                                module_id: newModuleId,
                                academic_year_id: targetYearId
                            }
                        }
                    });

                    if (!existing) {
                        await tx.programStructure.create({
                            data: {
                                program_id: newProgId,
                                specialization_id: newSpecId,
                                module_id: newModuleId,
                                semester_id: null,
                                academic_year_id: targetYearId,
                                academic_level: struct.academic_level,
                                semester_number: struct.semester_number,
                                module_type: struct.module_type,
                                credits: struct.credits
                            }
                        });
                        structuresCloned++;
                    }
                }
            }

            // 3. Clone Staff Assignments using remapped IDs
            if (options.staff) {
                const sourceAssignments = await tx.staffAssignment.findMany({
                    where: { academic_year_id: sourceYearId === 'none' ? null : sourceYearId }
                });

                for (const assign of sourceAssignments) {
                    const newModuleId = assign.module_id ? moduleIdMap.get(assign.module_id) : null;
                    const newProgId = assign.program_id ? programIdMap.get(assign.program_id) : null;
                    
                    const existing = await tx.staffAssignment.findUnique({
                        where: {
                            staff_id_module_id_academic_year_id: {
                                staff_id: assign.staff_id,
                                module_id: newModuleId || "",
                                academic_year_id: targetYearId
                            }
                        }
                    });

                    if (!existing) {
                        await tx.staffAssignment.create({
                            data: {
                                staff_id: assign.staff_id,
                                program_id: newProgId,
                                module_id: newModuleId,
                                academic_year_id: targetYearId,
                                role: assign.role,
                                active: true
                            }
                        });
                        staffCloned++;
                    }
                }
            }

            return { 
                modulesCloned, 
                structuresCloned, 
                staffCloned,
                programsCloned,
                specializationsCloned,
                gradingCloned,
                creditsCloned
            };
        });

        revalidatePath('/dashboard/admin/config/academic');
        return { success: true, data: result };

    } catch (error: any) {
        console.error("Cloning Failed:", error);
        return { success: false, error: error.message || "Cloning operation failed" };
    }
}
