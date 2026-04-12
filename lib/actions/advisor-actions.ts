'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function getAdvisorDashboardData() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    let userId = session.user.id;

    // Robust User Lookup
    let u = userId ? await prisma.user.findUnique({ where: { user_id: userId } }) : null;
    if (!u && session.user.email) {
        u = await prisma.user.findUnique({ where: { email: session.user.email } });
    }

    if (!u) throw new Error("Advisor unauthenticated");
    userId = u.user_id;

    const staffRecord = await prisma.staff.findUnique({
        where: { staff_id: userId },
        include: { user: true }
    });

    if (!staffRecord) throw new Error("Staff profile not found");

    // Check if staff is an advisor
    const advisorRecord = await prisma.advisor.findUnique({
        where: { advisor_id: staffRecord.staff_id },
        include: {
            students: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!advisorRecord) throw new Error("Staff is not assigned as an Advisor");

    // Safely map advisees explicitly filtering out null or incomplete associations
    const myStudents = advisorRecord.students.filter(s => s && s.user).map(s => ({
        id: s.student_id,
        studentId: s.student_id,
        firstName: s.user.first_name,
        lastName: s.user.last_name,
        currentGPA: s.current_gpa || 0,
        email: s.user.email
    }));

    const atRiskStudents = myStudents.filter(s => s.currentGPA < 2.5);

    // Summarize GPA logic
    const totalGPA = myStudents.reduce((sum, s) => sum + s.currentGPA, 0);
    const averageGPA = myStudents.length > 0 ? totalGPA / myStudents.length : 0;

    // Build performance distribution dynamically instead of mocked ranges
    let excellent = 0; let good = 0; let satisfactory = 0; let atRiskCount = 0;

    myStudents.forEach(s => {
        if (s.currentGPA >= 3.7) excellent++;
        else if (s.currentGPA >= 3.0) good++;
        else if (s.currentGPA >= 2.5) satisfactory++;
        else atRiskCount++;
    });

    const total = myStudents.length || 1; // Prevent div by zero
    const performanceDistribution = [
        { range: 'Excellent (3.7+)', students: excellent, percentage: Math.round((excellent / total) * 100) },
        { range: 'Good (3.0-3.69)', students: good, percentage: Math.round((good / total) * 100) },
        { range: 'Satisfactory (2.5-2.99)', students: satisfactory, percentage: Math.round((satisfactory / total) * 100) },
        { range: 'At Risk (<2.5)', students: atRiskCount, percentage: Math.round((atRiskCount / total) * 100) },
    ];

    // Real pending messages count
    const pendingMessages = await prisma.message.count({
        where: { recipient_id: userId, read_at: null }
    });

    // Real GPA Trend from GPAHistory
    const history = await prisma.gPAHistory.findMany({
        where: { student_id: { in: myStudents.map(s => s.studentId) } },
        orderBy: { calculation_date: 'asc' },
        take: 50
    });

    // Group by month and calculate average
    const trendMap = new Map();
    history.forEach(h => {
        const month = h.calculation_date.toLocaleString('default', { month: 'short' });
        if (!trendMap.has(month)) trendMap.set(month, { sum: 0, count: 0 });
        const entry = trendMap.get(month);
        entry.sum += h.gpa;
        entry.count += 1;
    });

    const gpaTrendData = Array.from(trendMap.entries()).map(([month, data]) => ({
        month,
        averageGPA: parseFloat((data.sum / data.count).toFixed(2))
    }));

    return {
        advisor: {
            firstName: staffRecord.user.first_name,
            lastName: staffRecord.user.last_name,
        },
        myStudents,
        atRiskStudents,
        pendingMessages,
        averageGPA,
        performanceDistribution,
        gpaTrendData: gpaTrendData.length ? gpaTrendData : [
            { month: 'Current', averageGPA: parseFloat(averageGPA.toFixed(2)) }
        ]
    };
}
