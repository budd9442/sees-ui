import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const settings = [
    { key: 'threshold_pass_class', value: '2.0', category: 'GPA' },
    { key: 'graduation_required_credits', value: '132', category: 'ACADEMIC' },
  ];

  for (const s of settings) {
    const now = new Date();
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, category: s.category, updated_at: now },
      create: { 
        setting_id: crypto.randomUUID(),
        key: s.key, 
        value: s.value, 
        category: s.category,
        updated_at: now
      },
    });
    console.log(`Upserted ${s.key}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
