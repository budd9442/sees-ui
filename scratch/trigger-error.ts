import { prisma } from '../lib/db';

async function main() {
  try {
    // @ts-ignore
    await prisma.staff.findFirst({
      include: {
        nonExistentField: true,
      }
    });
  } catch (err) {
    console.log(err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
