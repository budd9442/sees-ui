const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    console.log("Starting full institutional legacy migration...");
    
    try {
        await client.connect();
        
        const label = "2026-2027";
        const resYear = await client.query('SELECT academic_year_id FROM "AcademicYear" WHERE "label" = $1', [label]);
        
        if (resYear.rows.length === 0) {
            console.error(`Year ${label} not found. Please create it first.`);
            return;
        }
        
        const targetYearId = resYear.rows[0].academic_year_id;
        console.log(`Target Year ID: ${targetYearId}`);
        
        const tables = [
            "Module",
            "DegreeProgram",
            "Specialization",
            "GradingScheme",
            "academic_credit_rules",
            "ProgramStructure",
            "StaffAssignment"
        ];
        
        for (const table of tables) {
            console.log(`Checking legacy records in table: ${table}...`);
            const resLegacy = await client.query(`SELECT COUNT(*) FROM "${table}" WHERE "academic_year_id" IS NULL`);
            const legacyCount = parseInt(resLegacy.rows[0].count);
            
            if (legacyCount > 0) {
                console.log(`Moving ${legacyCount} records from ${table} to ${label}...`);
                const resUpdate = await client.query(
                    `UPDATE "${table}" SET "academic_year_id" = $1 WHERE "academic_year_id" IS NULL`,
                    [targetYearId]
                );
                console.log(`Successfully moved ${resUpdate.rowCount} records.`);
            } else {
                console.log(`No legacy records found in ${table}.`);
            }
        }
        
        console.log("Full migration complete.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await client.end();
    }
}

migrate();
