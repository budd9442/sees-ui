const { Client } = require('pg');
require('dotenv').config();

async function fix2026() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    console.log("Fixing 2026-2027 data sync (v2)...");
    
    try {
        await client.connect();
        
        const label = "2026-2027";
        const resYear = await client.query('SELECT academic_year_id, start_date, end_date FROM "AcademicYear" WHERE "label" = $1', [label]);
        
        if (resYear.rows.length === 0) {
            console.error(`Year ${label} not found.`);
            return;
        }
        
        const year = resYear.rows[0];
        const targetYearId = year.academic_year_id;
        const startDate = new Date(year.start_date);
        const endDate = new Date(year.end_date);
        
        // 1. Provision Semesters if 0
        const resSem = await client.query('SELECT COUNT(*) FROM "Semester" WHERE "academic_year_id" = $1', [targetYearId]);
        if (parseInt(resSem.rows[0].count) === 0) {
            console.log("Provisioning default semesters for 2026-2027 (matching schema)...");
            const midTime = startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2;
            const midDate = new Date(midTime);
            
            await client.query(
                'INSERT INTO "Semester" ("semester_id", "label", "academic_year_id", "start_date", "end_date") VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)',
                [
                    require('crypto').randomUUID(), "Semester 1", targetYearId, startDate, midDate,
                    require('crypto').randomUUID(), "Semester 2", targetYearId, new Date(midTime + 1000 * 60 * 60 * 24), endDate
                ]
            );
            console.log("Semesters provisioned.");
        }
        
        // 2. Provision Intakes for Programs
        console.log("Provisioning intakes for year-scoped programs...");
        const resProgs = await client.query('SELECT program_id FROM "DegreeProgram" WHERE "academic_year_id" = $1', [targetYearId]);
        
        for (const prog of resProgs.rows) {
            await client.query(
                `INSERT INTO "ProgramIntake" ("intake_id", "program_id", "academic_year_id", "min_students", "max_students", "status")
                 SELECT gen_random_uuid(), $1, $2, 30, 100, 'OPEN'
                 WHERE NOT EXISTS (SELECT 1 FROM "ProgramIntake" WHERE "program_id" = $1 AND "academic_year_id" = $2)`,
                [prog.program_id, targetYearId]
            );
        }
        console.log(`Intakes synced for ${resProgs.rows.length} programs.`);
        
        console.log("Fix complete.");
    } catch (error) {
        console.error("Fix failed:", error);
    } finally {
        await client.end();
    }
}

fix2026();
