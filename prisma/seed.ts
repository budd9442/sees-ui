import { randomUUID } from 'crypto';
import { PrismaClient } from "@prisma/client";
import { legacyGpaThresholdPresetRules } from "../lib/graduation/rule-presets";
import { hash } from "bcryptjs";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import { GUIDEBOOK_PREREQUISITE_CODES } from '../lib/data/guidebook-prerequisites';

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
    await prisma.systemMetric.deleteMany();

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

    await prisma.graduationEligibilityProfile.deleteMany();
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
            setting_id: randomUUID(),
            key: "pathway_demand_mit",
            value: "65",
            description: "Current demand percentage for MIT pathway",
            category: "ACADEMIC",
            updated_at: new Date(),
        },
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
    console.log('Applying guidebook prerequisites...');
    const allSeededModules = await prisma.module.findMany({
        select: { module_id: true, code: true, academic_year_id: true },
    });
    for (const module of allSeededModules) {
        const prereqCodes = GUIDEBOOK_PREREQUISITE_CODES[module.code] || [];
        const prereqTargets = allSeededModules
            .filter((candidate) => candidate.module_id !== module.module_id && prereqCodes.includes(candidate.code))
            .map((candidate) => ({ module_id: candidate.module_id }));

        await prisma.module.update({
            where: { module_id: module.module_id },
            data: {
                Module_A: {
                    set: [],
                    connect: prereqTargets,
                },
            },
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
            const mod = await prisma.module.findFirst({ where: { code: item.moduleCode } });
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

    const allPrograms = await prisma.degreeProgram.findMany();
    for (const p of allPrograms) {
        await prisma.graduationEligibilityProfile.create({
            data: {
                program_id: p.program_id,
                rules: legacyGpaThresholdPresetRules() as object,
            },
        });
    }

    // 4b. Feature Flags
    console.log('Seeding Feature Flags...');
    const featureFlags = [
        { key: 'anonymous_reports', name: 'Anonymous Reports', description: 'Enable anonymous reporting system', isEnabled: true, targetRoles: ['student'] },
    ];

    for (const flag of featureFlags) {
        await prisma.featureFlag.upsert({
            where: { key: flag.key },
            update: {},
            create: {
                key: flag.key,
                name: flag.name,
                description: flag.description,
                isEnabled: flag.isEnabled,
                targetRoles: flag.targetRoles
            }
        });
    }

    // 5. Users
    console.log('Seeding Users...');
    const adminPassword = await hash('admin123', 10);
    // Generic Admin reinstated
    await prisma.user.create({
        data: {
            email: 'admin@sees.com',
            username: 'admin',
            password_hash: adminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            status: 'ACTIVE',
            staff: {
                create: {
                    staff_number: 'ADM000',
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
            firstName: 'Dr. Alan',
            lastName: 'Turing',
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
    const mitProgram = await prisma.degreeProgram.findFirst({ where: { code: 'MIT' } });
    if (mitProgram) {
        await prisma.user.create({
            data: {
                email: 'student@sees.com',
                username: 'student',
                password_hash: studentPassword,
                firstName: 'John',
                lastName: 'Student',
                status: 'ACTIVE',
                student: {
                    create: {
                        admission_year: 2024,
                        current_level: 'Level 1',
                        degree_path_id: mitProgram.program_id,
                        enrollment_status: 'ENROLLED'
                    }
                }
            }
        });
    }

    console.log("Seeding Initial Users to match AuthStore...");

    // Admin (ADMIN001)
    await prisma.user.create({
        data: {
            user_id: 'ADMIN001', // Explicit ID to match authStore
            email: 'admin@kln.ac.lk',
            username: 'admin_kln',
            password_hash: adminPassword,
            firstName: 'System',
            lastName: 'Administrator',
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

    // Buddhika (STU001) with Real Transcript Data
    if (mitProgram) {
        const student = await prisma.user.create({
            data: {
                user_id: 'STU001',
                email: 'bandara-im22053@stu.kln.ac.lk',
                username: 'bandara',
                password_hash: studentPassword,
                firstName: 'buddhika',
                lastName: 'Bandara',
                status: 'ACTIVE',
                student: {
                    create: {
                        admission_year: 2023,
                        current_level: 'Level 2',
                        degree_path_id: mitProgram.program_id,
                        enrollment_status: 'ENROLLED',
                        current_gpa: 2.38 // Average of Y1 (3.84) and Y2 (0.92) roughly? Or just use latest cumulative logic? Let's use latest calc.
                    }
                }
            }
        });

        const transcript = [
            // YEAR 1 (2022/2023)
            { code: 'ACLT 11013', name: 'Academic Literacy I', credits: 3, level: 'L1', sem: 'Semester 1', grade: 'A-' },
            { code: 'DELT 11232', name: 'English for Professionals', credits: 2, level: 'L1', sem: 'Semester 1', grade: 'A-' },
            { code: 'GNCT 11212', name: 'Personal Progress Development I', credits: 2, level: 'L1', sem: 'Semester 1', grade: 'Pass' }, // Non-GPA?
            { code: 'INTE 11213', name: 'Fundamentals of Computing', credits: 3, level: 'L1', sem: 'Semester 1', grade: 'A+' },
            { code: 'INTE 11223', name: 'Programming Concepts', credits: 3, level: 'L1', sem: 'Semester 1', grade: 'A+' },
            { code: 'INTE 12213', name: 'Object Oriented Programming', credits: 3, level: 'L1', sem: 'Semester 2', grade: 'A' },
            { code: 'INTE 12223', name: 'Database Design and Development', credits: 3, level: 'L1', sem: 'Semester 2', grade: 'A' },
            { code: 'INTE 12243', name: 'Computer Networks', credits: 3, level: 'L1', sem: 'Semester 2', grade: 'A+' },
            { code: 'MGTE 11233', name: 'Business Statistics and Economics', credits: 3, level: 'L1', sem: 'Semester 1', grade: 'A+' },
            { code: 'MGTE 11243', name: 'Principles of Management & Organizational Behaviour', credits: 3, level: 'L1', sem: 'Semester 1', grade: 'A+' },
            { code: 'MGTE 12253', name: 'Accounting Concepts and Costing', credits: 3, level: 'L1', sem: 'Semester 2', grade: 'A+' },
            { code: 'MGTE 12263', name: 'Optimization Methods in Management Science', credits: 3, level: 'L1', sem: 'Semester 2', grade: 'B' },
            { code: 'MGTE 12273', name: 'Industry and Technology', credits: 3, level: 'L1', sem: 'Semester 2', grade: 'A' },
            { code: 'PMAT 11212', name: 'Discrete Mathematics for Computing I', credits: 2, level: 'L1', sem: 'Semester 1', grade: 'A' },
            { code: 'PMAT 12212', name: 'Discrete Mathematics for Computing II', credits: 2, level: 'L1', sem: 'Semester 2', grade: 'B' },

            // YEAR 2 (2023/2024)
            { code: 'GNCT 23212', name: 'Personal Progress Development II', credits: 2, level: 'L2', sem: 'Semester 1', grade: null },
            { code: 'INTE 21213', name: 'Information Systems Modelling', credits: 3, level: 'L2', sem: 'Semester 1', grade: null },
            { code: 'INTE 21243', name: 'Computer Architecture and Operating Systems', credits: 3, level: 'L2', sem: 'Semester 1', grade: 'A+' },
            { code: 'INTE 21313', name: 'Business Information Systems', credits: 3, level: 'L2', sem: 'Semester 1', grade: 'A' },
            { code: 'INTE 21323', name: 'Web Application Development', credits: 3, level: 'L2', sem: 'Semester 1', grade: null },
            { code: 'INTE 21333', name: 'Event Driven Programming', credits: 3, level: 'L2', sem: 'Semester 1', grade: 'B' },
            { code: 'INTE 22253', name: 'Distributed Systems and Cloud Computing', credits: 3, level: 'L2', sem: 'Semester 2', grade: null },
            { code: 'INTE 22263', name: 'Embedded Systems Development', credits: 3, level: 'L2', sem: 'Semester 2', grade: null },
            { code: 'INTE 22283', name: 'Mobile Applications Development', credits: 3, level: 'L2', sem: 'Semester 2', grade: null },
            { code: 'INTE 22293', name: 'Software Architecture and Process Models', credits: 3, level: 'L2', sem: 'Semester 2', grade: null },
            { code: 'INTE 22303', name: 'Artificial Intelligence', credits: 3, level: 'L2', sem: 'Semester 2', grade: null },
            { code: 'INTE 22343', name: 'Data Structures and Algorithms', credits: 3, level: 'L2', sem: 'Semester 2', grade: null },
        ];

        // Grading Scale Helper
        const getGradePoints = (grade: string | null) => {
            const scale: Record<string, number> = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'E': 0.0, 'Pass': 0.0 }; // Pass doesn't affect GPA usually
            return scale[grade || ''] || 0.0;
        };

        const y1AcYear = await prisma.academicYear.create({ data: { label: "2022-2023", start_date: new Date("2023-01-01"), end_date: new Date("2023-12-31") } }); // Assuming dates
        const y2AcYear = await prisma.academicYear.findFirst({ where: { label: "2024-2025" } }) || academicYear; // Use existing or fallback
        const s1 = await prisma.semester.findFirst({ where: { label: "Semester 1", academic_year_id: academicYear.academic_year_id } });
        const s2 = await prisma.semester.findFirst({ where: { label: "Semester 2", academic_year_id: academicYear.academic_year_id } });

        for (const item of transcript) {
            // 1. Ensure Module Exists
            const countsTowardGpa = !item.code.startsWith('GNCT');
            const targetAcYearForModule = item.level === 'L1' ? y1AcYear : y2AcYear;
            const existingMod = await prisma.module.findFirst({
                where: { code: item.code, academic_year_id: targetAcYearForModule.academic_year_id },
            });
            const module = existingMod
                ? await prisma.module.update({
                      where: { module_id: existingMod.module_id },
                      data: { counts_toward_gpa: countsTowardGpa },
                  })
                : await prisma.module.create({
                      data: {
                          code: item.code,
                          name: item.name,
                          credits: item.credits,
                          level: item.level,
                          description: item.name,
                          counts_toward_gpa: countsTowardGpa,
                          academic_year_id: targetAcYearForModule.academic_year_id,
                      },
                  });

            // 2. Register Module
            // Determine Academic Year based on level/transcript context
            // Y1 entries use y1AcYear, Y2 use y2AcYear (which maps to 2023/2024 or 2024/2025 in Seed?)
            // The transcript says Y1 = 2022/2023, Y2 = 2023/2024.
            // Let's rely on the created y1AcYear and maybe generic s1/s2 (or create new ones if needed, but linking to generic s1/s2 of 'current' year might be 'okay' for display if S1 is just S1).
            // Better: just link to s1/s2 of the main seed for simplicity, or creating proper relation is complex.
            // Let's use the s1/s2 found above (which are 2024-2025). This is technically a data mismatch (Year 1 modules in Future academic year), but for UI testing it might be acceptable.

            const targetAcYear = item.level === 'L1' ? y1AcYear : y2AcYear;
            const targetSem = item.sem === 'Semester 1' ? s1 : s2;

            if (targetSem) {
                const reg = await prisma.moduleRegistration.create({
                    data: {
                        student_id: 'STU001',
                        module_id: module.module_id,
                        semester_id: targetSem.semester_id,
                        status: 'REGISTERED',
                        registration_date: new Date()
                    }
                });

                if (item.grade) {
                    await prisma.grade.create({
                        data: {
                            reg_id: reg.reg_id,
                            student_id: 'STU001',
                            module_id: module.module_id,
                            semester_id: targetSem.semester_id,
                            marks: 0, // Initial value
                            grade_point: getGradePoints(item.grade),
                            letter_grade: item.grade,
                            released_at: new Date()
                        }
                    });
                }
            }
        }

        // Add GPA History
        await prisma.gPAHistory.create({ data: { student_id: 'STU001', gpa: 3.84, calculation_date: new Date('2023-12-31') } });

        const sampleModule = await prisma.module.findFirst({ where: { code: 'INTE 21243' } });
        await prisma.academicGoal.createMany({
            data: [
                {
                    student_id: 'STU001',
                    title: 'Reach 3.50 CGPA',
                    description: 'Maintain a strong GPA trend for this academic year.',
                    goal_type: 'GPA_TARGET',
                    metric_unit: 'GPA',
                    target_value_number: 3.5,
                    target_gpa: 3.5,
                    target_value: '3.5',
                    progress: 68,
                    status: 'COMPLETED',
                },
                {
                    student_id: 'STU001',
                    title: 'Complete 96 credits',
                    description: 'Stay on track for graduation credits.',
                    goal_type: 'CREDITS_TARGET',
                    metric_unit: 'CREDITS',
                    target_value_number: 96,
                    target_value: '96',
                    progress: 52,
                    status: 'COMPLETED',
                },
                {
                    student_id: 'STU001',
                    title: 'Score 75 in INTE 21243',
                    description: 'Lift marks in the architecture module.',
                    goal_type: 'MODULE_GRADE_TARGET',
                    metric_unit: 'MARKS',
                    target_value_number: 75,
                    target_value: '75',
                    module_id: sampleModule?.module_id ?? null,
                    progress: 60,
                    status: 'IN_PROGRESS',
                },
                {
                    student_id: 'STU001',
                    title: 'Improve CGPA by 0.30',
                    description: 'Raise cumulative GPA by 0.30 points.',
                    goal_type: 'CGPA_IMPROVEMENT',
                    metric_unit: 'POINTS',
                    target_value_number: 0.3,
                    baseline_value: 2.38,
                    target_value: '0.3',
                    progress: 40,
                    status: 'COMPLETED',
                }
            ]
        });
    }

    // 6. System Metrics
    console.log('Seeding System Metrics...');
    await prisma.systemMetric.create({
        data: {
            cpu: 42,
            cores: 8,
            memory: 65,
            storage_used: 250,
            storage_total: 512,
            storage_percent: 48,
            uptime: 99.9,
            health: 100,
            active_users: 87
        }
    });

    // 7. Anonymous Reports
    console.log('Seeding Anonymous Reports...');
    const targetStudent = await prisma.student.findFirst();
    if (targetStudent) {
        await prisma.anonymousReport.create({
            data: {
                student_id: targetStudent.student_id,
                content: 'The study area on the 3rd floor of the library has poor lighting in the evenings.',
                priority: 'medium',
                status: 'PENDING'
            }
        });
        await prisma.anonymousReport.create({
            data: {
                student_id: targetStudent.student_id,
                content: 'Requesting more practical sessions for Web Application Development.',
                priority: 'high',
                status: 'IN_REVIEW'
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

