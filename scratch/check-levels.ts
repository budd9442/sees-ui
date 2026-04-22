import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

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
  const levelCounts = await prisma.student.groupBy({
    by: ['current_level'],
    _count: {
      student_id: true,
    },
  });

  console.log('Level Distribution:');
  levelCounts.forEach((lc) => {
    console.log(`${lc.current_level || 'NULL'}: ${lc._count.student_id}`);
  });

  const enrollmentCounts = await prisma.student.groupBy({
    by: ['enrollment_status'],
    _count: {
      student_id: true,
    },
  });

  console.log('\nEnrollment Status Distribution:');
  enrollmentCounts.forEach((ec) => {
    console.log(`${ec.enrollment_status}: ${ec._count.student_id}`);
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
