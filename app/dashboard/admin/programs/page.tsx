import { getAllPrograms } from '@/lib/actions/admin-programs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateProgramDialog } from './_components/CreateProgramDialog';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function ProgramsPage() {
    const programs = await getAllPrograms();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Academic Programs</h2>
                    <p className="text-muted-foreground">Manage degree programs, specializations, and curriculum structure.</p>
                </div>
                <CreateProgramDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {programs.map((program) => (
                    <Card key={program.program_id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-bold">
                                {program.code}
                            </CardTitle>
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
