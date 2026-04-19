import { prisma } from '../lib/db';

async function main() {
  try {
    const staff = await prisma.staff.findFirst({
      select: {
        staff_id: true,
        advisor_profile: true,
      }
    });
    console.log('Success selecting advisor_profile:', !!staff);
  } catch (err) {
    console.error('Error selecting advisor_profile:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
