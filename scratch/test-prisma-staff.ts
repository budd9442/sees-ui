import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const staff = await prisma.staff.findFirst({
      include: {
        advisor: true,
      }
    });
    console.log('Success including advisor:', !!staff);
  } catch (err) {
    console.error('Error including advisor:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
