
import 'dotenv/config';
import { prisma } from '../lib/db';

async function main() {
    console.log('--- Fixing Missing Student Levels ---');

    const students = await prisma.student.findMany({
        where: {
            current_level: null,
            enrollment_status: 'ENROLLED'
        }
    });

    console.log(`Found ${students.length} students with missing levels.`);

    const currentYear = new Date().getFullYear();
    let updatedCount = 0;

    for (const student of students) {
        let calculatedLevel = 'L1';

        // Logic: 
        // 2026 (Now) - 2026 (Adm) + 1 = 1 -> L1
        // 2026 (Now) - 2025 (Adm) + 1 = 2 -> L2

        const diff = currentYear - student.admission_year + 1;

        if (diff >= 4) calculatedLevel = 'L4';
        else if (diff === 3) calculatedLevel = 'L3';
        else if (diff === 2) calculatedLevel = 'L2';
        else if (diff <= 1) calculatedLevel = 'L1';

        // If diff is exceptionally high (e.g. > 5), they might be delayed or should be graduated?
        // Plan says cap at L4 for now.

        console.log(`Updating student ${student.student_id} (Adm: ${student.admission_year}) -> ${calculatedLevel}`);

        await prisma.student.update({
            where: { student_id: student.student_id },
            data: { current_level: calculatedLevel }
        });
        updatedCount++;
    }

    console.log(`Updated ${updatedCount} students.`);
    await prisma.$disconnect();
}

main().catch(console.error);
