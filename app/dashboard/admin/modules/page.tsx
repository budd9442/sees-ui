export const dynamic = "force-dynamic";
import { getModules, syncGuideBookPrerequisites, toggleModuleStatus } from '@/lib/actions/admin-modules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { ModuleDialog } from './_components/ModuleDialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal, Pencil, Archive } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleModuleStatusButton } from './_components/ToggleModuleStatusButton';
import { AssignStaffDialog } from './_components/AssignStaffDialog';
import { ModuleYearSelector } from './_components/ModuleYearSelector';

import { prisma } from '@/lib/db';

export default async function AdminModulesPage(props: { searchParams: Promise<{ q?: string, year?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams.q || '';
    
    const academicYears = await prisma.academicYear.findMany({ 
        orderBy: { start_date: 'desc' } 
    });
    const now = new Date();
    const activeYear = academicYears.find(y => now >= y.start_date && now <= y.end_date) || academicYears.find(y => y.active);
    const yearId = searchParams.year || activeYear?.academic_year_id || 'active';
    
    const modules = await getModules(query, yearId);

    const selectedYear = yearId === 'all' ? null : 
                         yearId === 'active' ? activeYear : 
                         academicYears.find(y => y.academic_year_id === yearId);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Module Management"
                description={`Managing modules for ${selectedYear?.label || 'Legacy/All'}`}
            >
                <div className="flex items-center gap-2">
                    <form action={syncGuideBookPrerequisites}>
                        <Button type="submit" variant="outline">Sync Guidebook Prerequisites</Button>
                    </form>
                    <ModuleDialog
                        academicYearId={selectedYear?.academic_year_id}
                        availableModules={modules}
                    />
                </div>
            </PageHeader>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search modules..."
                        className="pl-8"
                        defaultValue={query}
                    />
                </div>
                <div className="w-full md:w-64">
                    <ModuleYearSelector 
                        academicYears={academicYears} 
                        currentYear={yearId} 
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Modules</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {modules.map((module) => (
                                <TableRow key={module.module_id}>
                                    <TableCell className="font-medium">{module.code}</TableCell>
                                    <TableCell>{module.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-[10px]">
                                            {module.academic_year?.label || 'Legacy'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{module.level}</TableCell>
                                    <TableCell>{module.credits}</TableCell>
                                    <TableCell>
                                        <Badge variant={module.active ? 'default' : 'secondary'}>
                                            {module.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <ModuleDialog
                                                module={module}
                                                availableModules={modules}
                                                trigger={
                                                    <Button variant="ghost" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                            <AssignStaffDialog
                                                moduleId={module.module_id}
                                                moduleName={module.name}
                                            />
                                            <ToggleModuleStatusButton id={module.module_id} active={module.active} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
