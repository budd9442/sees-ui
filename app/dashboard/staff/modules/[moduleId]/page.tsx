import { getEnrolledStudents, getModuleGradingScaleForStaff } from '@/lib/actions/staff-actions';
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

    const [students, initialScale] = await Promise.all([
        getEnrolledStudents(moduleId),
        getModuleGradingScaleForStaff(moduleId),
    ]);

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
                    <CardTitle>Enrolled students & marks</CardTitle>
                    <CardDescription>
                        This screen is for <strong>entering and publishing marks</strong> for this module only. It is
                        not the same as <strong>Admin → GPA Config</strong>, which sets institution-wide GPA calculation
                        and the default grading scheme. Use <strong>Grade bands</strong> (button on the grading panel)
                        only if you need to view or override how percentage marks map to letters for this module.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StudentGradingClient students={students} moduleId={moduleId} initialScale={initialScale} />
                </CardContent>
            </Card>
        </div>
    );
}
