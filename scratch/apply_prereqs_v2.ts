import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const mapping = JSON.parse(fs.readFileSync('d:\\dev\\sees-ui\\scratch\\prereqs_mapping.json', 'utf8'));

  console.log(`Processing ${Object.keys(mapping).length} modules for prerequisites...`);

  for (const [targetCode, prereqCodes] of Object.entries(mapping)) {
    // Try both with and without 'b' or other suffixes if needed
    const findTarget = async (code: string) => {
      let mods = await prisma.module.findMany({ where: { code } });
      if (mods.length === 0 && !code.endsWith('b')) {
        mods = await prisma.module.findMany({ where: { code: code + 'b' } });
      }
      return mods;
    };

    const targetModules = await findTarget(targetCode);

    if (targetModules.length === 0) {
      console.warn(`Target module not found: ${targetCode}`);
      continue;
    }

    console.log(`Updating ${targetModules.length} instance(s) of ${targetCode}...`);

    for (const targetModule of targetModules) {
      const prereqModuleIds = [];

      for (const prereqCode of prereqCodes as string[]) {
        const findPrereq = async (code: string) => {
          let mods = await prisma.module.findMany({ where: { code } });
          if (mods.length === 0 && !code.endsWith('b')) {
            mods = await prisma.module.findMany({ where: { code: code + 'b' } });
          }
          return mods;
        };

        const prereqModules = await findPrereq(prereqCode);

        if (prereqModules.length === 0) {
          console.warn(`  Prerequisite module not found: ${prereqCode} for ${targetCode}`);
          continue;
        }

        // Try to find a prereq module with the same academic year
        let bestPrereq = prereqModules.find(m => m.academic_year_id === targetModule.academic_year_id);
        
        if (!bestPrereq) {
          bestPrereq = prereqModules.find(m => m.academic_year_id === null) || prereqModules[0];
        }

        if (bestPrereq) {
          prereqModuleIds.push(bestPrereq.module_id);
        }
      }

      if (prereqModuleIds.length > 0) {
        await prisma.module.update({
          where: { module_id: targetModule.module_id },
          data: {
            Module_A: {
              connect: prereqModuleIds.map(id => ({ module_id: id }))
            }
          }
        });
        console.log(`  Connected ${prereqModuleIds.length} prerequisite(s) to ${targetCode} (${targetModule.academic_year_id || 'Global'})`);
      }
    }
  }

  console.log('Finished updating prerequisites.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
