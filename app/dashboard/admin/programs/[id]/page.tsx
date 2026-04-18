export const dynamic = "force-dynamic";
import { getProgramById, getAllModulesSimple, getAllAcademicYears } from '@/lib/actions/admin-programs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProgramStructureView } from './_components/ProgramStructureView';
import { CreateSpecializationDialog } from './_components/CreateSpecializationDialog';
import { ProgramIntakeConfig } from './_components/ProgramIntakeConfig';

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const program = await getProgramById(id);
    const modules = await getAllModulesSimple();
    const academicYears = await getAllAcademicYears();

    if (!program) {
        return <div>Program not found</div>;
    }

    // Safely cast to expected types or rely on inference
    // Assuming standard Prisma camelCase mapping for output
    const p = program as any;
    const pId = p.programId || p.program_id;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin/programs">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{p.name} ({p.code})</h2>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                </div>
            </div>

            <Tabs defaultValue="structure" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                    <TabsTrigger value="structure">Structure</TabsTrigger>
                    <TabsTrigger value="specializations">Specializations</TabsTrigger>
                    <TabsTrigger value="intake">Intake Config</TabsTrigger>
                </TabsList>

                <TabsContent value="structure" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Curriculum Structure</CardTitle>
                                <p className="text-sm text-muted-foreground">Modules assigned to this program by Level/Semester.</p>
                            </div>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Module</Button>
                        </CardHeader>
                        <CardContent>
                            <ProgramStructureView
                                programId={pId}
                                structure={p.structure}
                                modules={modules as any}
                                specializations={p.specializations}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="specializations" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Specializations</CardTitle>
                                <p className="text-sm text-muted-foreground">Tracks within this degree.</p>
                            </div>
                            <CreateSpecializationDialog programId={pId} />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {program.specializations.map(spec => (
                                    <div key={spec.specialization_id} className="flex items-center justify-between border p-4 rounded-md">
                                        <div>
                                            <div className="font-medium">{spec.name}</div>
                                            <div className="text-sm text-muted-foreground">{spec.code}</div>
                                        </div>
                                        <Badge variant={spec.active ? 'default' : 'secondary'}>
                                            {spec.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="intake" className="space-y-4 pt-4">
                    <ProgramIntakeConfig
                        programId={pId}
                        intakes={p.intakes}
                        academicYears={academicYears as any}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

