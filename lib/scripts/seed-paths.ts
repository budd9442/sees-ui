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

async function ensureDegreeProgram(code: string, name: string, is_common: boolean) {
  const existing = await prisma.degreeProgram.findFirst({
    where: { code, academic_year_id: null },
  });
  if (existing) {
    return prisma.degreeProgram.update({
      where: { program_id: existing.program_id },
      data: { name, is_common },
    });
  }
  return prisma.degreeProgram.create({
    data: { code, name, is_common, academic_year_id: null },
  });
}

async function main() {
  console.log('🌱 Seeding Academic Path Transitions...');

  // 1. Create/Ensure MIT and IT Degree Programs
  const mitCommon = await ensureDegreeProgram('MIT-COMMON', 'MIT (Common Foundation)', true);
  const mitSpec = await ensureDegreeProgram(
    'MIT',
    'B.Sc. in Management & Information Technology',
    false
  );
  const itSpec = await ensureDegreeProgram('IT', 'B.Sc. in Information Technology', false);

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
