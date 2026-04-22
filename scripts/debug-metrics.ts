import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing User.count()...');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);

    console.log('Testing SystemMetric.create()...');
    const metric = await prisma.systemMetric.create({
      data: {
        cpu: 10,
        cores: 4,
        memory: 20,
        storage_used: 100,
        storage_total: 500,
        storage_percent: 20,
        uptime: 99.9,
        health: 100,
        active_users: userCount,
      }
    });
    console.log('Metric created:', metric.id);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
