
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const codes = ['ACLT 11013', 'MGTE 11243', 'GNCT 23212', 'INTE 22213', 'ACLT11013', 'MGTE11243', 'GNCT23212', 'INTE22213'];
    
    console.log('--- Checking Modules ---');
    const modules = await prisma.module.findMany({
        where: {
            code: { in: codes }
        }
    });

    if (modules.length === 0) {
        console.log('No modules found matching these codes.');
        // Try partial match
        const allModules = await prisma.module.findMany({
            select: { code: true, name: true }
        });
        console.log(`Total modules in DB: ${allModules.length}`);
        const partials = allModules.filter(m => codes.some(c => m.code.includes(c.replace(/\s+/g, '')) || c.replace(/\s+/g, '').includes(m.code)));
        console.log('Partial matches:', partials);
    } else {
        modules.forEach(m => {
            console.log(`Found: ${m.code} - ${m.name}`);
        });
    }

    console.log('\n--- Checking Program Structure for L1/L2 ---');
    const structures = await prisma.programStructure.findMany({
        where: {
            academic_level: { in: ['L1', 'L2'] }
        },
        include: { module: true }
    });
    console.log(`Total L1/L2 structures: ${structures.length}`);
    
    const unmatched = codes.filter(c => !structures.some(s => s.module.code === c.replace(/\s+/g, '')));
    console.log('Codes not in L1/L2 structures:', unmatched);
}

main().catch(console.error).finally(() => prisma.$disconnect());
