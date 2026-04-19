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
  const profiles = await prisma.graduationEligibilityProfile.findMany();
  
  for (const profile of profiles) {
    let rules = profile.rules as any;
    let changed = false;

    if (!rules || typeof rules !== 'object') continue;

    // 1. Rename 'Third Class' label to 'Pass'
    if (rules.divisions) {
      for (const divId in rules.divisions) {
        if (rules.divisions[divId].label === 'Third Class') {
          rules.divisions[divId].label = 'Pass';
          changed = true;
        }
      }
    }

    // 2. Map THIRD_PASS to BASE_DEGREE if applicable, or just ensure BASE_DEGREE is 'Pass'
    if (rules.divisions && rules.divisions.THIRD_PASS && !rules.divisions.BASE_DEGREE) {
        rules.divisions.BASE_DEGREE = rules.divisions.THIRD_PASS;
        delete rules.divisions.THIRD_PASS;
        if (rules.evaluationOrder) {
            rules.evaluationOrder = rules.evaluationOrder.map((id: string) => id === 'THIRD_PASS' ? 'BASE_DEGREE' : id);
        }
        changed = true;
    }

    if (changed) {
      await prisma.graduationEligibilityProfile.update({
        where: { profile_id: profile.profile_id },
        data: { rules: rules as any }
      });
      console.log(`Updated profile ${profile.profile_id}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
