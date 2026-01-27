const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { contains: 'admin' } },
                { staff: { staff_type: 'ADMIN' } }
            ]
        },
        include: { staff: true, student: true }
    });

    console.log('Admin User Found:', JSON.stringify(admin, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
