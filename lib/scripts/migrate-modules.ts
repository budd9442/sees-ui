import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// IDs from previous research
const COMMON_ID = "24bcdfbd-b096-438c-b69e-ad906fbdaf00"; // MIT-COMMON
const MIT_ID = "ca7dfed6-55a9-46c5-bee1-7034852ea30b";
const IT_ID = "65bd1828-487f-486b-be24-4f7e7c5e5ee2";

async function main() {
  console.log('🚀 Starting Academic Module Reorganization...');

  // 1. Fetch all L1 modules from MIT and IT
  const sourceStructures = await prisma.programStructure.findMany({
    where: {
      program_id: { in: [MIT_ID, IT_ID] },
      academic_level: 'L1'
    }
  });

  console.log(`Found ${sourceStructures.length} Level 1 mapping records to consolidate.`);

  // 2. Consolidate into unique module set for Common program
  const uniqueModules = new Map();

  for (const struct of sourceStructures) {
    const key = `${struct.module_id}-${struct.semester_number}-${struct.module_type}`;
    if (!uniqueModules.has(key)) {
      uniqueModules.set(key, {
        module_id: struct.module_id,
        semester_id: struct.semester_id,
        academic_level: 'L1',
        semester_number: struct.semester_number,
        module_type: struct.module_type,
        credits: struct.credits
      });
    }
  }

  console.log(`Consolidated into ${uniqueModules.size} unique modules for MIT (Common Foundation).`);

  // 3. Insert/Update into MIT-COMMON
  // Using findMany + manual check to avoid Prisma's upsert null constraint issues with composite keys
  const existingCommon = await prisma.programStructure.findMany({
    where: { program_id: COMMON_ID, specialization_id: null }
  });
  const existingModuleIds = new Set(existingCommon.map(e => e.module_id));

  let createdCount = 0;
  let updatedCount = 0;

  for (const mod of uniqueModules.values()) {
    if (existingModuleIds.has(mod.module_id)) {
        // Update existing
        await prisma.programStructure.updateMany({
            where: { program_id: COMMON_ID, specialization_id: null, module_id: mod.module_id },
            data: {
                semester_id: mod.semester_id,
                academic_level: mod.academic_level,
                semester_number: mod.semester_number,
                module_type: mod.module_type,
                credits: mod.credits
            }
        });
        updatedCount++;
    } else {
        // Create new
        await prisma.programStructure.create({
            data: {
                program_id: COMMON_ID,
                module_id: mod.module_id,
                semester_id: mod.semester_id,
                academic_level: mod.academic_level,
                semester_number: mod.semester_number,
                module_type: mod.module_type,
                credits: mod.credits
            }
        });
        createdCount++;
    }
  }

  console.log(`✅ Successfully processed Common MIT: ${createdCount} created, ${updatedCount} updated.`);

  // 4. Cleanup old specialized L1 entries
  const deleteRes = await prisma.programStructure.deleteMany({
    where: {
      program_id: { in: [MIT_ID, IT_ID] },
      academic_level: 'L1'
    }
  });

  console.log(`🗑️ Removed ${deleteRes.count} redundant Level 1 records from MIT and IT programs.`);
  console.log('✨ Migration Complete.');
}

main()
  .catch((e) => {
    console.error('❌ Migration Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
