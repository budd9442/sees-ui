
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- L1 Program Structure ---');
    const l1 = await prisma.programStructure.findMany({
        where: { academic_level: 'L1' },
        include: { module: true }
    });
    l1.forEach(ps => {
        console.log(`[${ps.academic_level}] ${ps.module.code} - ${ps.module.name} (Year: ${ps.academic_year_id})`);
    });

    console.log('\n--- L2 Program Structure ---');
    const l2 = await prisma.programStructure.findMany({
        where: { academic_level: 'L2' },
        include: { module: true }
    });
    l2.forEach(ps => {
        console.log(`[${ps.academic_level}] ${ps.module.code} - ${ps.module.name} (Year: ${ps.academic_year_id})`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
