const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
