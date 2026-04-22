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
  console.log('Migrating student levels to standardized format (L1, L2, L3, L4)...');

  const mapping = {
    'Level 1': 'L1',
    'Level 2': 'L2',
    'Level 3': 'L3',
    'Level 4': 'L4',
    'Level1': 'L1',
    'Level2': 'L2',
    'Level3': 'L3',
    'Level4': 'L4',
  };

  for (const [oldVal, newVal] of Object.entries(mapping)) {
    const res = await prisma.student.updateMany({
      where: { current_level: oldVal },
      data: { current_level: newVal },
    });
    console.log(`Updated ${res.count} students from "${oldVal}" to "${newVal}"`);
  }

  console.log('Migration complete.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
