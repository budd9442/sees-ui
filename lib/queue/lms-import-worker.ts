import amqp from 'amqplib';
import { prisma } from '../db';
import { fetchKlnScienceFacultyRegistrationYears } from '../lms/kln-science-faculty-client';
import { inferStudentAcademicContext } from '../lms/lms-inference';
import { matchByCodeOrName, type CatalogModule } from '../lms/lms-matching';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'lms_import';

const globalForWorker = globalThis as unknown as { 
    isLmsWorkerRunning: boolean;
    lmsWorkerConn?: any;
    lmsWorkerChan?: any;
};
let isWorkerRunning = globalForWorker.isLmsWorkerRunning || false;

function lmsYearToAcademicLevel(year: number) {
    if (year <= 1) return 'L1';
    if (year === 2) return 'L2';
    if (year === 3) return 'L3';
    return 'L4';
}

function parseAttempt(v: string) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
}

function normalizeGradeLetter(grade: string) {
    const g = String(grade ?? '').trim();
    return g ? g : null;
}

export async function startLmsImportWorker() {
    if (isWorkerRunning) {
        console.log('[QUEUE] LMS Import Worker is already running. Skipping initialization.');
        return;
    }

    // Set immediately to prevent concurrent startup attempts during HMR
    isWorkerRunning = true;
    globalForWorker.isLmsWorkerRunning = true;

    try {
        console.log('[QUEUE] Connecting to RabbitMQ for LMS Import...');
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.prefetch(1);

        globalForWorker.lmsWorkerConn = connection;
        globalForWorker.lmsWorkerChan = channel;
        console.log(`[QUEUE] LMS Import Worker initialized successfully. Listening on "${QUEUE_NAME}"`);

    channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) return;
        console.log(`[QUEUE] <<< Received message from "${QUEUE_NAME}"`);
        const raw = msg.content.toString();
        let content: any = null;
        try {
            content = JSON.parse(raw);
        } catch {
            // Ignore malformed payload.
        }

        const sessionId = content?.session_id as string | undefined;
        const studentId = content?.student_id as string | undefined;
        const lmsUsername = content?.lms_username as string | undefined;
        const lmsPassword = content?.lms_password as string | undefined;

        if (!sessionId || !studentId || !lmsUsername || !lmsPassword) {
            channel.ack(msg);
            return;
        }

        const prismaAny = prisma as any;
        try {
            console.log(`[LMS WORKER] Processing session ${sessionId} for student ${studentId}`);
            await prismaAny.lmsImportSession.update({
                where: { session_id: sessionId },
                data: { status: 'RUNNING', stage: 'LOGIN', progress_pct: 5, error_message: null },
            });

            const onStage = async (stage: string, progressPct: number) => {
                console.log(`[LMS WORKER] Stage: ${stage}, Progress: ${progressPct}%`);
                // Keep the number of writes small (this runs only a few times per import).
                await prismaAny.lmsImportSession.update({
                    where: { session_id: sessionId },
                    data: { stage, progress_pct: progressPct },
                });
            };

            console.log(`[LMS WORKER] Starting scrape for ${lmsUsername}...`);
            const scrape = await fetchKlnScienceFacultyRegistrationYears({
                username: lmsUsername,
                password: lmsPassword,
                onStage,
            });
            console.log(`[LMS WORKER] Scrape completed. Found years: ${Object.keys(scrape.years).join(', ')}`);

            await prismaAny.lmsImportSession.update({
                where: { session_id: sessionId },
                data: { stage: 'MATCHING', progress_pct: 85 },
            });

            const student = await prisma.student.findUnique({
                where: { student_id: studentId },
                select: {
                    student_id: true,
                    degree_path_id: true,
                    specialization_id: true,
                },
            });

            if (!student) throw new Error('Student not found for import session.');

            const inferred = await inferStudentAcademicContext({
                prisma,
                lmsYears: scrape.years,
            });

            const currentLevel = inferred.currentLevel;
            const levelNum = currentLevel === 'L4' ? 4 : currentLevel === 'L3' ? 3 : currentLevel === 'L2' ? 2 : 1;

            const degreePathId =
                levelNum >= 2 && inferred.pathway?.programId ? inferred.pathway.programId : student.degree_path_id;

            const specializationId =
                levelNum >= 3 && inferred.specialization?.specializationId ? inferred.specialization.specializationId : student.specialization_id;

            const activeYear = await prisma.academicYear.findFirst({ where: { active: true } });
            const activeAcademicYearId = activeYear?.academic_year_id ?? null;
            const semesters = await prisma.semester.findMany({
                where: { academic_year_id: activeAcademicYearId ?? undefined } as any,
                select: { semester_id: true, label: true },
            });

            // Fallback: if labels mismatch, just take the first two.
            const semester1 = semesters.find((s) => /semester\s*1/i.test(s.label)) ?? semesters[0];
            const semester2 = semesters.find((s) => /semester\s*2/i.test(s.label)) ?? semesters[1];
            if (!semester1 || !semester2) throw new Error('Missing semester records for active academic year.');

            const yearsToImport = ([1, 2, 3, 4] as const).filter((y) => (scrape.years as any)[y]?.rows?.length > 0);

            const academicYearOr =
                activeAcademicYearId != null
                    ? [{ academic_year_id: activeAcademicYearId }, { academic_year_id: null }]
                    : [{ academic_year_id: null }];

            const specializationOr =
                specializationId
                    ? [{ specialization_id: null }, { specialization_id: specializationId }]
                    : [{ specialization_id: null }];

            // Build matching catalog.
            // Important: Year 1/2 modules are common across programs and may not be
            // present under the student's pathway-specific `degreePathId` record.
            // We therefore allow ProgramStructure lookup across all programs for L1/L2,
            // but keep L3/L4 constrained by inferred specialization.
            const programStructuresL12 = await prisma.programStructure.findMany({
                where: {
                    academic_level: { in: ['L1', 'L2'] },
                    AND: [{ OR: academicYearOr }],
                } as any,
                include: {
                    module: { select: { module_id: true, code: true, name: true } },
                },
            });

            const programStructuresL34 = await prisma.programStructure.findMany({
                where: {
                    program_id: degreePathId,
                    academic_level: { in: ['L3', 'L4'] },
                    AND: [{ OR: academicYearOr }, { OR: specializationOr }],
                } as any,
                include: {
                    module: { select: { module_id: true, code: true, name: true } },
                },
            });

            const catalogByLevel = new Map<string, CatalogModule[]>();
            const pushCatalog = (ps: any) => {
                const level = String(ps.academic_level);
                const arr = catalogByLevel.get(level) ?? [];
                arr.push({
                    module_id: ps.module.module_id,
                    code: ps.module.code,
                    name: ps.module.name,
                    semester_number: ps.semester_number,
                    semester_id: ps.semester_id,
                });
                catalogByLevel.set(level, arr);
            };

            for (const ps of [...(programStructuresL12 as any[]), ...(programStructuresL34 as any[])]) {
                pushCatalog(ps);
            }

            const registrations: Array<{
                semester_id: string;
                module_id: string;
                attempt_no: number;
                grade_letter: string | null;
                lms_year: number;
            }> = [];

            const registrationsKey = new Set<string>();

            const yearsPreview: Record<string, any> = {};
            let releasedCount = 0;

            for (const year of yearsToImport) {
                const yearRows = scrape.years[year]?.rows ?? [];
                const academicLevel = lmsYearToAcademicLevel(year);
                const catalog = catalogByLevel.get(academicLevel) ?? [];

                let matchedCount = 0;
                let releasedYear = 0;
                const matchedModulesForYear: Array<{
                    module_code: string;
                    module_name: string;
                    lms_course_code: string;
                    lms_course_name: string;
                    grade_letter: string | null;
                }> = [];
                const unmatchedModulesForYear: Array<{
                    lms_course_code: string;
                    lms_course_name: string;
                }> = [];
                const unmatchedKeys = new Set<string>();

                for (const r of yearRows) {
                    const attempt_no = parseAttempt(r.attempt);
                    const grade_letter = normalizeGradeLetter(r.grade);

                    const hit = matchByCodeOrName({
                        lmsCourseCode: r.courseCode,
                        lmsCourseName: r.courseName,
                        catalog,
                    });

                    if (!hit.matched) {
                        const k = `${String(r.courseCode ?? '').trim()}::${String(r.courseName ?? '').trim()}`;
                        if (!unmatchedKeys.has(k)) {
                            unmatchedKeys.add(k);
                            unmatchedModulesForYear.push({
                                lms_course_code: r.courseCode,
                                lms_course_name: r.courseName,
                            });
                        }
                        continue;
                    }

                    const mod = hit.module;

                    const semester_id =
                        mod.semester_id ??
                        (mod.semester_number === 1
                            ? semester1.semester_id
                            : mod.semester_number === 2
                              ? semester2.semester_id
                              : null);

                    if (!semester_id) {
                        throw new Error(`Missing semester mapping for module ${mod.code}`);
                    }

                    const regKey = [mod.module_id, semester_id, attempt_no, grade_letter ?? ''].join('|');
                    if (registrationsKey.has(regKey)) continue;
                    registrationsKey.add(regKey);

                    registrations.push({
                        module_id: mod.module_id,
                        semester_id,
                        attempt_no,
                        grade_letter,
                        lms_year: year,
                    });

                    matchedCount++;
                    if (grade_letter) {
                        releasedYear++;
                        releasedCount++;
                    }

                    matchedModulesForYear.push({
                        module_code: mod.code,
                        module_name: mod.name,
                        lms_course_code: r.courseCode,
                        lms_course_name: r.courseName,
                        grade_letter,
                    });
                }

                yearsPreview[year] = {
                    total_count: yearRows.length,
                    matched_count: matchedCount,
                    released_count: releasedYear,
                    matched_modules: matchedModulesForYear,
                    unmatched_modules: unmatchedModulesForYear,
                };
            }

            const inferredPathwayCode = inferred.pathway?.pathwayCode ?? null;
            const inferredSpecCode = inferred.specialization?.specializationCode ?? null;

            const previewJson = {
                inferred: {
                    current_level: currentLevel,
                    pathway_code: inferredPathwayCode,
                    specialization_code: levelNum >= 3 ? inferredSpecCode : null,
                    pathway_program_id: degreePathId,
                    specialization_id: levelNum >= 3 ? specializationId ?? null : null,
                },
                stats: {
                    released_grades_count: releasedCount,
                },
                years: yearsPreview,
                registrations,
            };

            await prismaAny.lmsImportSession.update({
                where: { session_id: sessionId },
                data: {
                    status: 'PREVIEW_READY',
                    stage: 'READY',
                    progress_pct: 100,
                    preview_json: previewJson,
                    error_message: null,
                },
            });

            channel.ack(msg);
        } catch (err: any) {
            await prismaAny.lmsImportSession.update({
                where: { session_id: sessionId },
                data: {
                    status: 'FAILED',
                    stage: 'READY',
                    progress_pct: 100,
                    error_message: err?.message ?? 'Import failed',
                },
            });
            channel.ack(msg);
        }
    });

    connection.on('close', () => {
        isWorkerRunning = false;
        globalForWorker.isLmsWorkerRunning = false;
    });

    } catch (error: any) {
        console.error('[QUEUE] CRITICAL: Failed to start LMS Import Worker:', error.message);
        isWorkerRunning = false;
        globalForWorker.isLmsWorkerRunning = false;
        
        // Retry connection after 5 seconds
        setTimeout(startLmsImportWorker, 5000);
    }
}

// Manual startup.
if (require.main === module) {
    startLmsImportWorker();
}

