import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const academicYears = await prisma.academicYear.findMany({
    orderBy: { start_date: 'desc' }
  });
  console.log('Academic Years:', academicYears.map(y => ({ id: y.academic_year_id, label: y.label })));

  const modules = await prisma.module.findMany({
    take: 5,
    select: { code: true, academic_year_id: true }
  });
  console.log('Sample Modules:', modules);
}

main().catch(console.error).finally(() => prisma.$disconnect());
