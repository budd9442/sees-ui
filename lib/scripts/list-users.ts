import { prisma } from '/Users/budd/dev/sees-ui/lib/db';

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                email: true,
                first_name: true,
                last_name: true,
                staff: { select: { staff_type: true } },
                student: { select: { student_id: true } }
            }
        });
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
