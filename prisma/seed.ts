
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const dataPath = path.join(process.cwd(), 'guide_data.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const guideData = JSON.parse(rawData);

async function clearDb() {
    console.log("Clearing database...");
    // Child tables first
    await prisma.grade.deleteMany();
    await prisma.moduleRegistration.deleteMany();
    await prisma.gPAHistory.deleteMany();
    await prisma.academicGoal.deleteMany();
    await prisma.ranking.deleteMany();
    await prisma.anonymousReport.deleteMany();

    await prisma.programStructure.deleteMany();
    await prisma.programIntake.deleteMany();
    await prisma.staffAssignment.deleteMany();
    await prisma.lectureSchedule.deleteMany();

    await prisma.student.deleteMany();
    await prisma.advisor.deleteMany();
    await prisma.hOD.deleteMany();
    await prisma.staff.deleteMany();

    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();

    await prisma.user.deleteMany();

    await prisma.specialization.deleteMany();
    await prisma.degreeProgram.deleteMany();
    await prisma.module.deleteMany();

    await prisma.semester.deleteMany();
    await prisma.academicYear.deleteMany();
    await prisma.systemSetting.deleteMany();
    await prisma.gradingBand.deleteMany();
    await prisma.gradingScheme.deleteMany();
    console.log("Database cleared.");
}

async function main() {
    await clearDb();
    console.log("Seeding started...");

    // 1. System Settings
    await prisma.systemSetting.create({
        data: {
            key: "pathway_demand_mit",
            value: "65",
            description: "Current demand percentage for MIT pathway",
            category: "ACADEMIC"
        }
    });

    // 2. Academic Years & Semesters
    const academicYear = await prisma.academicYear.create({
        data: {
            label: "2024-2025",
            start_date: new Date("2024-01-01"),
            end_date: new Date("2024-12-31"),
        }
    });

    const semester1 = await prisma.semester.create({
        data: {
            academic_year_id: academicYear.academic_year_id,
            label: "Semester 1",
            start_date: new Date("2024-02-01"),
            end_date: new Date("2024-06-30"),
        }
    });

    const semester2 = await prisma.semester.create({
        data: {
            academic_year_id: academicYear.academic_year_id,
            label: "Semester 2",
            start_date: new Date("2024-08-01"),
            end_date: new Date("2024-12-31"),
        }
    });

    // 3. Modules
    console.log(`Seeding ${guideData.modules.length} modules...`);
    for (const m of guideData.modules) {
        await prisma.module.create({
            data: {
                code: m.code,
                name: m.name,
                credits: m.credits,
                level: m.level || 'L1', // Default
                description: m.description || `Module ${m.name}`
            }
        });
    }

    // 4. Degree Programs & Structure
    for (const prog of guideData.programs) {
        console.log(`Seeding program: ${prog.name}...`);
        const degree = await prisma.degreeProgram.create({
            data: {
                code: prog.code,
                name: prog.name,
                description: prog.name
            }
        });

        // Specializations
        // MIT has 3 specializations extracted from logic or hardcoded if text parsing was partial
        // "BSE", "OSCM", "IS"
        let specs: Record<string, any> = {};

        if (prog.code === 'MIT') {
            specs['BSE'] = await prisma.specialization.create({
                data: {
                    code: 'BSE',
                    name: 'Business Systems Engineering',
                    program_id: degree.program_id
                }
            });
            specs['OSCM'] = await prisma.specialization.create({
                data: {
                    code: 'OSCM',
                    name: 'Operations and Supply Chain Management',
                    program_id: degree.program_id
                }
            });
            specs['IS'] = await prisma.specialization.create({
                data: {
                    code: 'IS',
                    name: 'Information Systems',
                    program_id: degree.program_id
                }
            });
        }

        // Structure
        for (const item of prog.structure) {
            const mod = await prisma.module.findUnique({ where: { code: item.moduleCode } });
            if (!mod) {
                console.warn(`Module not found for structure: ${item.moduleCode}`);
                continue;
            }

            // Determine Scope (General vs Specialization)
            // Logic: 
            // If Year 1 or 2, usually General (Module for Program).
            // If Year 3/4, check rawType columns.

            const raw = item.rawType || "C";
            // Split by tabs or multiple spaces
            const parts = raw.split(/\s+/).filter((s: string) => s.length > 0);

            // Program Structure Entry Helper
            const addStruct = async (specId: string | null, type: string) => {
                // Check duplicate first (Prisma unique constraint)
                const existing = await prisma.programStructure.findFirst({
                    where: {
                        program_id: degree.program_id,
                        specialization_id: specId,
                        module_id: mod.module_id
                    }
                });
                if (existing) return;

                await prisma.programStructure.create({
                    data: {
                        program_id: degree.program_id,
                        specialization_id: specId,
                        module_id: mod.module_id,
                        academic_level: `L${item.year}`,
                        semester_number: item.semester,
                        module_type: type === 'C' ? 'CORE' : (type === 'O' ? 'ELECTIVE' : 'OPTIONAL')
                    }
                });
            };

            if (prog.code === 'MIT' && (item.year >= 3)) {
                // Expecting 3 columns: BSE, OSCM, IS
                // e.g. "C", "C", "C"
                // If parts length < 3, assume applies to all?
                if (parts.length >= 3) {
                    await addStruct(specs['BSE'].specialization_id, parts[0]);
                    await addStruct(specs['OSCM'].specialization_id, parts[1]);
                    await addStruct(specs['IS'].specialization_id, parts[2]);
                } else {
                    // Fallback: Add to Degree base
                    await addStruct(null, parts[0] || "C");
                }
            } else {
                // Common years 1 & 2 or IT program
                await addStruct(null, parts[0] || "C");
            }
        }

        // Intake
        await prisma.programIntake.create({
            data: {
                program_id: degree.program_id,
                academic_year_id: academicYear.academic_year_id,
                min_students: 50,
                max_students: 150,
                status: 'OPEN'
            }
        });
    }

    // 5. Users
    console.log('Seeding Users...');
    const adminPassword = await hash('admin123', 10);
    await prisma.user.create({
        data: {
            email: 'admin@sees.com',
            username: 'admin',
            password_hash: adminPassword,
            first_name: 'Super',
            last_name: 'Admin',
            status: 'ACTIVE',
            staff: {
                create: {
                    staff_number: 'ADM001',
                    staff_type: 'ADMIN',
                    department: 'Registry'
                }
            }
        }
    });

    const staffPassword = await hash('staff123', 10);
    const lecturer = await prisma.user.create({
        data: {
            email: 'lecturer@sees.com',
            username: 'lecturer',
            password_hash: staffPassword,
            first_name: 'Dr. Alan',
            last_name: 'Turing',
            status: 'ACTIVE',
            staff: {
                create: {
                    staff_number: 'LEC001',
                    staff_type: 'ACADEMIC',
                    department: 'Computing'
                }
            }
        }
    });

    const studentPassword = await hash('student123', 10);
    const mitProgram = await prisma.degreeProgram.findUnique({ where: { code: 'MIT' } });
    if (mitProgram) {
        await prisma.user.create({
            data: {
                email: 'student@sees.com',
                username: 'student',
                password_hash: studentPassword,
                first_name: 'John',
                last_name: 'Student',
                status: 'ACTIVE',
                student: {
                    create: {
                        admission_year: 2024,
                        current_level: 'L1',
                        degree_path_id: mitProgram.program_id,
                        enrollment_status: 'ENROLLED'
                    }
                }
            }
        });
    }

    console.log("Seeding completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

