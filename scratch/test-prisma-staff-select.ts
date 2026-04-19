import { prisma } from '../lib/db';

async function main() {
  try {
    const staff = await prisma.staff.findFirst({
      select: {
        staff_id: true,
        advisor: true,
      }
    });
    console.log('Success selecting advisor:', !!staff);
  } catch (err) {
    console.error('Error selecting advisor:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
