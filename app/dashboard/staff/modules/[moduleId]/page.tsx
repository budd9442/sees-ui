import { getEnrolledStudents } from '@/lib/actions/staff-actions';
import { notFound } from 'next/navigation';
import StudentGradingClient from './grading-view';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/db';

interface PageProps {
    params: Promise<{
        moduleId: string;
    }>;
}

export default async function ModuleGradingPage({ params }: PageProps) {
    const { moduleId } = await params;

    // Fetch basic module info for header
    const moduleInfo = await prisma.module.findUnique({
        where: { module_id: moduleId }
    });

    if (!moduleInfo) notFound();

    const students = await getEnrolledStudents(moduleId);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Grading: {moduleInfo.code}</h1>
                <p className="text-muted-foreground mt-1">
                    {moduleInfo.name}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                    <CardDescription>Enter marks below. Grades are calculated automatically based on standard scheme (A {'>'}= 85, B {'>'}= 70...)</CardDescription>
                </CardHeader>
                <CardContent>
                    <StudentGradingClient students={students} moduleId={moduleId} />
                </CardContent>
            </Card>
        </div>
    );
}
