
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, ...values] = line.split('=');
        const value = values.join('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
}

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
    const modules = await prisma.module.count();
    const programs = await prisma.degreeProgram.count();
    const structures = await prisma.programStructure.count();
    const users = await prisma.user.count();
    const specs = await prisma.specialization.count();
    const semesters = await prisma.semester.count();

    console.log("=== Verification Results ===");
    console.log(`Modules: ${modules}`);
    console.log(`Programs: ${programs}`);
    console.log(`Program Structures: ${structures}`);
    console.log(`Users: ${users}`);
    console.log(`Specializations: ${specs}`);
    console.log(`Semesters: ${semesters}`);

    // Check MIT Structure for Year 3 (Level L3)
    const mit = await prisma.degreeProgram.findUnique({ where: { code: 'MIT' } });
    if (mit) {
        const l3Structs = await prisma.programStructure.findMany({
            where: {
                program_id: mit.program_id,
                academic_level: 'L3'
            },
            include: { specialization: true, module: true }
        });
        console.log(`MIT L3 Structure Count: ${l3Structs.length}`);

        // Sample check for a specialized module
        // "INTE 31356 Software Development Project" should be Core for all (C C C)
        // "MGTE 31413 Warehouse Management..." should be Optional for BSE, Core for OSCM, Optional for IS (O C O)

        const sample1 = l3Structs.find(s => s.module.code === 'MGTE 31413');
        if (sample1) {
            console.log(`Sample MGTE 31413 Type: ${sample1.module_type}, Spec: ${sample1.specialization?.code || 'None'}`);
        }

        // We expect MULTIPLE entries for MGTE 31413 if it differs by specialization?
        // My logic was: create entry per specialization with correct type.
        const samples = l3Structs.filter(s => s.module.code === 'MGTE 31413');
        console.log(`Entries for MGTE 31413: ${samples.length}`);
        samples.forEach(s => console.log(` - Spec: ${s.specialization?.code}, Type: ${s.module_type}`));
    }
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
