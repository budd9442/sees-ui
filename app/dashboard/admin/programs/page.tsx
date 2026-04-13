import { getAllPrograms } from '@/lib/actions/admin-programs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateProgramDialog } from './_components/CreateProgramDialog';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

import { prisma } from '@/lib/db';
import { ModuleYearSelector } from '../modules/_components/ModuleYearSelector';

export default async function ProgramsPage(props: { searchParams: Promise<{ q?: string, year?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams.q || '';
    const academicYears = await prisma.academicYear.findMany({ orderBy: { start_date: 'desc' } });
    const now = new Date();
    const activeYear = academicYears.find(y => now >= y.start_date && now <= y.end_date) || academicYears.find(y => y.active);
    const yearId = searchParams.year || activeYear?.academic_year_id || 'active';
    
    const programs = await getAllPrograms(query, yearId);

    const selectedYear = yearId === 'all' ? null : 
                         yearId === 'active' ? activeYear : 
                         academicYears.find(y => y.academic_year_id === yearId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Academic Programs</h2>
                    <p className="text-muted-foreground">Managing programs for {selectedYear?.label || 'Legacy/All'}</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-full md:w-64">
                        <ModuleYearSelector 
                            academicYears={academicYears} 
                            currentYear={yearId} 
                            basePath="/dashboard/admin/programs"
                            allLabel="All Programs (Archive)"
                        />
                    </div>
                    <CreateProgramDialog academicYearId={selectedYear?.academic_year_id} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {programs.map((program) => (
                    <Card key={program.program_id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex flex-col gap-1">
                                <CardTitle className="text-xl font-bold">
                                    {program.code}
                                </CardTitle>
                                <Badge variant="outline" className="w-fit text-[10px] font-mono">
                                    {program.academic_year?.label || 'Legacy'}
                                </Badge>
                            </div>
                            <Link href={`/dashboard/admin/programs/${program.program_id}`}>
                                <Button variant="outline" size="sm">Manage</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium mb-2">{program.name}</div>
                            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                                {program.description}
                            </p>

                            <Separator className="my-2" />

                            <div className="mt-2 space-y-1">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specializations</h4>
                                {program.specializations.length > 0 ? (
                                    <ul className="text-sm space-y-1">
                                        {program.specializations.map((spec) => (
                                            <li key={spec.specialization_id} className="flex items-center text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                                                {spec.name} ({spec.code})
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">No specializations defined</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
