/**
 * Seed script: Upserts the chatbot_db_access_enabled SystemSetting.
 * Run with: npx tsx scripts/seed-chatbot-setting.ts
 */
import { prisma } from '../lib/db';

async function main() {
  await prisma.systemSetting.upsert({
    where: { key: 'chatbot_db_access_enabled' },
    create: {
      setting_id: 'chatbot_db_access_enabled',
      key: 'chatbot_db_access_enabled',
      value: 'true',
      description: 'When false, the SEES chatbot falls back to guide-book-only mode (no live DB queries). Toggle from Admin > System Settings.',
      category: 'AI',
      updated_at: new Date(),
    },
    update: {},  // Do not overwrite an existing value (admin may have changed it)
  });

  console.log('✅ chatbot_db_access_enabled setting seeded (value unchanged if already existed).');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
