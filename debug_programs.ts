
import 'dotenv/config';
import { prisma } from './lib/db';

async function main() {
    const programs = await prisma.degreeProgram.findMany();
    console.log(JSON.stringify(programs, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
