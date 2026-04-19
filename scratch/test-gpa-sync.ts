import 'dotenv/config';
import { prisma } from '../lib/db';
import { pushToQueue } from '../lib/queue/queue-service';

async function test() {
    console.log('--- Testing GPA Background Sync ---');

    // 1. Find a test student
    const student = await prisma.student.findFirst({
        select: { student_id: true, current_gpa: true, academic_class: true }
    });

    if (!student) {
        console.error('No student found in DB.');
        return;
    }

    console.log(`Found student: ${student.student_id}`);
    console.log(`Initial GPA: ${student.current_gpa}, Class: ${student.academic_class}`);

    // 2. Trigger recalculation via RabbitMQ
    console.log('Pushing recalculation task to queue...');
    const success = await pushToQueue('gpa_recalculation', { studentIds: [student.student_id] });

    if (success) {
        console.log('Task pushed successfully. Waiting 10 seconds for worker to process...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // 3. Verify results
        const updatedStudent = await prisma.student.findUnique({
            where: { student_id: student.student_id },
            select: { current_gpa: true, academic_class: true }
        });

        const history = await prisma.gPAHistory.findFirst({
            where: { student_id: student.student_id },
            orderBy: { calculation_date: 'desc' }
        });

        console.log('--- Verification ---');
        console.log(`Updated GPA: ${updatedStudent?.current_gpa}`);
        console.log(`Updated Class: ${updatedStudent?.academic_class}`);
        console.log(`History Record Found: ${!!history}`);
        if (history) {
            console.log(`History GPA: ${history.gpa}, History Date: ${history.calculation_date}`);
        }
    } else {
        console.error('Failed to push to queue.');
    }

    await prisma.$disconnect();
}

test().catch(console.error);
