import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Explicitly load .env
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL is not defined in environment.');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Academic Path Transitions...');

  // 1. Create/Ensure MIT and IT Degree Programs
  const mitCommon = await prisma.degreeProgram.upsert({
    where: { code: 'MIT-COMMON' },
    update: { name: 'MIT (Common Foundation)', is_common: true },
    create: { code: 'MIT-COMMON', name: 'MIT (Common Foundation)', is_common: true },
  });

  const mitSpec = await prisma.degreeProgram.upsert({
    where: { code: 'MIT' },
    update: { name: 'B.Sc. in Management & Information Technology', is_common: false },
    create: { code: 'MIT', name: 'B.Sc. in Management & Information Technology', is_common: false },
  });

  const itSpec = await prisma.degreeProgram.upsert({
    where: { code: 'IT' },
    update: { name: 'B.Sc. in Information Technology', is_common: false },
    create: { code: 'IT', name: 'B.Sc. in Information Technology', is_common: false },
  });

  // 2. Create Transition Rules
  await prisma.academicPathTransition.upsert({
    where: { 
      source_program_id_target_program_id_level: {
        source_program_id: mitCommon.program_id,
        target_program_id: mitSpec.program_id,
        level: 'L2'
      }
    },
    update: {},
    create: {
      source_program_id: mitCommon.program_id,
      target_program_id: mitSpec.program_id,
      level: 'L2'
    }
  });

  await prisma.academicPathTransition.upsert({
    where: { 
      source_program_id_target_program_id_level: {
        source_program_id: mitCommon.program_id,
        target_program_id: itSpec.program_id,
        level: 'L2'
      }
    },
    update: {},
    create: {
      source_program_id: mitCommon.program_id,
      target_program_id: itSpec.program_id,
      level: 'L2'
    }
  });

  // 3. Ensure Feature Flag exists
  await prisma.featureFlag.upsert({
    where: { key: 'pathway_selection' },
    update: { name: 'Pathway Selection', description: 'Enable specialized degree selection for L2 students', isEnabled: true },
    create: { key: 'pathway_selection', name: 'Pathway Selection', description: 'Enable specialized degree selection for L2 students', isEnabled: true },
  });

  console.log('✅ Academic Path Transitions seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
