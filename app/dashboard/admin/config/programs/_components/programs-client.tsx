'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import {
    Plus,
    Edit,
    Trash2,
    Save,
    RefreshCw,
    AlertCircle,
    Copy,
    Download,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { exportTabularData } from '@/lib/export';
import {
    createProgram,
    updateProgram,
    deactivateProgram,
} from '@/lib/actions/admin-programs';

export default function ProgramsConfigClient({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [degreePrograms, setDegreePrograms] = useState(initialData.programs || []);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<any>(null);
    const [newProgram, setNewProgram] = useState({
        name: '', code: '', description: '', totalCredits: 120, duration: 3, pathways: [] as string[],
        specializations: {} as Record<string, string[]>, capacityLimits: {} as Record<string, number>, moduleMappings: [] as string[],
    });

    const handleCreateProgram = async () => {
        if (!newProgram.name || !newProgram.code) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await createProgram({
                code: newProgram.code.trim(),
                name: newProgram.name.trim(),
                description: newProgram.description?.trim() || undefined,
            });
            toast.success('Degree program created successfully!');
            setShowCreateDialog(false);
            setNewProgram({ name: '', code: '', description: '', totalCredits: 120, duration: 3, pathways: [], specializations: {}, capacityLimits: {}, moduleMappings: [] });
            router.refresh();
        } catch (e: any) {
            toast.error(e?.message || 'Failed to create program.');
        }
    };

    const handleEditProgram = (program: any) => {
        setSelectedProgram({ ...program });
        setShowEditDialog(true);
    };

    const handleUpdateProgram = async () => {
        if (!selectedProgram) return;

        try {
            await updateProgram(selectedProgram.id, {
                name: selectedProgram.name?.trim(),
                code: selectedProgram.code?.trim(),
                description: selectedProgram.description?.trim() ?? '',
            });
            toast.success('Degree program updated successfully!');
            setShowEditDialog(false);
            setSelectedProgram(null);
            router.refresh();
        } catch (e: any) {
            toast.error(e?.message || 'Failed to update program.');
        }
    };

    const handleDeleteProgram = async (programId: string) => {
        if (
            confirm(
                'Deactivate this program? It will be hidden from active use; related data is kept.'
            )
        ) {
            try {
                await deactivateProgram(programId);
                toast.success('Program deactivated.');
                router.refresh();
            } catch (e: any) {
                toast.error(e?.message || 'Failed to deactivate program.');
            }
        }
    };

    const handleDuplicateProgram = (program: any) => {
        setNewProgram({ ...program, name: `${program.name} (Copy)`, code: `${program.code}_COPY` });
        setShowCreateDialog(true);
    };

    const handleToggleProgramStatus = async (programId: string) => {
        const program = degreePrograms.find((p: any) => p.id === programId);
        if (!program) return;
        const newStatus = program.status === 'active' ? 'inactive' : 'active';
        try {
            await updateProgram(programId, { active: newStatus === 'active' });
            toast.success('Program status updated successfully!');
            router.refresh();
        } catch (e: any) {
            toast.error(e?.message || 'Failed to update program status.');
        }
    };

    const exportPrograms = async (format: 'pdf' | 'excel' | 'csv') => {
        try {
            const rows = degreePrograms.map((program: any) => ({
                name: program.name,
                code: program.code,
                description: program.description || '',
                durationYears: program.duration,
                totalCredits: program.totalCredits,
                status: program.status,
                pathways: (program.pathways || []).join(', '),
                moduleCount: (program.moduleMappings || []).length,
            }));
            await exportTabularData(rows, format, { filename: `programs-${Date.now()}` });
            toast.success(`Programs exported as ${format.toUpperCase()}`);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to export programs');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-50';
            case 'inactive': return 'text-red-600 bg-red-50';
            case 'draft': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Degree Program Configuration</h1>
                    <p className="text-muted-foreground mt-1">Configure degree programs, pathways, and specializations</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => void exportPrograms('csv')}><Download className="mr-2 h-4 w-4" />Export Programs</Button>
                    <Button onClick={() => setShowCreateDialog(true)}><Plus className="mr-2 h-4 w-4" />Create Program</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Programs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{degreePrograms.length}</div><p className="text-xs text-muted-foreground">Active programs</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Pathways</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{degreePrograms.reduce((sum: number, program: any) => sum + (program.pathways?.length ?? 0), 0)}</div><p className="text-xs text-muted-foreground">Across all programs</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Specializations</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{degreePrograms.reduce((sum: number, program: any) => sum + Object.values(program.specializations || {}).reduce((specSum: number, specs: any) => specSum + (Array.isArray(specs) ? specs.length : 0), 0), 0)}</div><p className="text-xs text-muted-foreground">Available options</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Capacity</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{degreePrograms.reduce((sum: number, program: any) => sum + Object.values(program.capacityLimits).reduce((capSum: number, cap: any) => capSum + cap, 0), 0)}</div><p className="text-xs text-muted-foreground">Student capacity</p></CardContent></Card>
            </div>

            <Tabs defaultValue="programs" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="programs">Programs</TabsTrigger>
                    <TabsTrigger value="pathways">Pathways</TabsTrigger>
                    <TabsTrigger value="specializations">Specializations</TabsTrigger>
                    <TabsTrigger value="modules">Module Mappings</TabsTrigger>
                </TabsList>

                <TabsContent value="programs" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Degree Programs</CardTitle><CardDescription>Manage degree programs and their configurations</CardDescription></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Program</TableHead><TableHead>Code</TableHead><TableHead>Duration</TableHead><TableHead>Credits</TableHead><TableHead>Pathways</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {degreePrograms.map((program: any) => (
                                        <TableRow key={program.id}>
                                            <TableCell><div><div className="font-medium">{program.name}</div><div className="text-sm text-muted-foreground">{(program.description || '').slice(0, 50)}{(program.description || '').length > 50 ? '…' : ''}</div></div></TableCell>
                                            <TableCell><Badge variant="outline">{program.code}</Badge></TableCell>
                                            <TableCell><div className="font-medium">{program.duration} years</div></TableCell>
                                            <TableCell><div className="font-medium">{program.totalCredits}</div></TableCell>
                                            <TableCell><div className="text-sm">{(program.pathways?.length ?? 0)} pathways</div></TableCell>
                                            <TableCell><Badge className={getStatusColor(program.status)}>{program.status}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditProgram(program)}><Edit className="h-4 w-4" /></Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleDuplicateProgram(program)}><Copy className="h-4 w-4" /></Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleToggleProgramStatus(program.id)}><RefreshCw className="h-4 w-4" /></Button>
                                                    <Button variant="outline" size="sm" title="Deactivate" onClick={() => handleDeleteProgram(program.id)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pathways" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Pathway Configuration</CardTitle><CardDescription>Configure pathways for each degree program</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {degreePrograms.map((program: any) => (
                                    <div key={program.id} className="p-4 rounded-lg border">
                                        <div className="flex items-center justify-between mb-3"><h4 className="font-semibold">{program.name}</h4><Badge variant="outline">{program.pathways.length} pathways</Badge></div>
                                        <div className="grid gap-2 md:grid-cols-2">
                                            {program.pathways.map((pathway: string) => (
                                                <div key={pathway} className="p-3 rounded bg-muted">
                                                    <div className="flex items-center justify-between"><span className="font-medium">{pathway}</span><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Capacity: {program.capacityLimits[pathway as keyof typeof program.capacityLimits] || 'N/A'}</span><Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button></div></div>
                                                </div>
                                            ))}
                                            {program.pathways.length === 0 && <span className="text-muted-foreground text-sm">No pathways</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="specializations" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Specialization Configuration</CardTitle><CardDescription>Configure specializations for each pathway</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {degreePrograms.map((program: any) => (
                                    <div key={program.id} className="p-4 rounded-lg border">
                                        <h4 className="font-semibold mb-3">{program.name}</h4>
                                        <div className="space-y-3">
                                            {Object.keys(program.specializations).length === 0 && <span className="text-muted-foreground text-sm">No specializations</span>}
                                            {Object.entries(program.specializations).map(([pathway, specializations]: any) => (
                                                <div key={pathway} className="p-3 rounded bg-muted">
                                                    <h5 className="font-medium mb-2">{pathway}</h5>
                                                    <div className="grid gap-2 md:grid-cols-2">
                                                        {specializations.map((specialization: string) => (
                                                            <div key={specialization} className="flex items-center justify-between p-2 rounded bg-background"><span className="text-sm">{specialization}</span><Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="modules" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Module Mappings</CardTitle><CardDescription>Configure module mappings for each degree program</CardDescription></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {degreePrograms.map((program: any) => (
                                    <div key={program.id} className="p-4 rounded-lg border">
                                        <div className="flex items-center justify-between mb-3"><h4 className="font-semibold">{program.name}</h4><Badge variant="outline">{program.moduleMappings.length} modules</Badge></div>
                                        <div className="grid gap-2 md:grid-cols-3">
                                            {program.moduleMappings.map((module: string) => (
                                                <div key={module} className="p-2 rounded bg-muted"><div className="flex items-center justify-between"><span className="text-sm font-medium">{module}</span><Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button></div></div>
                                            ))}
                                            {program.moduleMappings.length === 0 && <span className="text-muted-foreground text-sm">No modules</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader><DialogTitle>Create Degree Program</DialogTitle><DialogDescription>Create a new degree program with pathways and specializations</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2"><Label htmlFor="name">Program Name</Label><Input id="name" value={newProgram.name} onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })} placeholder="e.g., Master of Information Technology" /></div>
                            <div className="space-y-2"><Label htmlFor="code">Program Code</Label><Input id="code" value={newProgram.code} onChange={(e) => setNewProgram({ ...newProgram, code: e.target.value })} placeholder="e.g., MIT" /></div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={newProgram.description} onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })} placeholder="Program description..." rows={3} /></div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2"><Label htmlFor="totalCredits">Total Credits</Label><Input id="totalCredits" type="number" value={newProgram.totalCredits} onChange={(e) => setNewProgram({ ...newProgram, totalCredits: parseInt(e.target.value) })} /></div>
                            <div className="space-y-2"><Label htmlFor="duration">Duration (Years)</Label><Input id="duration" type="number" value={newProgram.duration} onChange={(e) => setNewProgram({ ...newProgram, duration: parseInt(e.target.value) })} /></div>
                        </div>
                        <div className="space-y-2">
                            <Label>Pathways</Label>
                            <div className="space-y-2">
                                <Input placeholder="Add pathway (press Enter to add)" onKeyPress={(e) => { if (e.key === 'Enter') { const pathway = e.currentTarget.value.trim(); if (pathway && !newProgram.pathways.includes(pathway)) { setNewProgram({ ...newProgram, pathways: [...newProgram.pathways, pathway] }); e.currentTarget.value = ''; } } }} />
                                <div className="flex flex-wrap gap-2">
                                    {newProgram.pathways.map((pathway, index) => (
                                        <Badge key={index} variant="secondary" className="flex items-center gap-1">{pathway}<button onClick={() => setNewProgram({ ...newProgram, pathways: newProgram.pathways.filter((_, i) => i !== index) })}><X className="h-3 w-3" /></button></Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>Configuration Note</AlertTitle><AlertDescription>You can configure specializations and capacity limits after creating the program.</AlertDescription></Alert>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button><Button onClick={handleCreateProgram}><Plus className="mr-2 h-4 w-4" />Create Program</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader><DialogTitle>Edit Degree Program</DialogTitle><DialogDescription>Update degree program configuration</DialogDescription></DialogHeader>
                    {selectedProgram && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2"><Label htmlFor="edit-name">Program Name</Label><Input id="edit-name" value={selectedProgram.name} onChange={(e) => setSelectedProgram({ ...selectedProgram, name: e.target.value })} /></div>
                                <div className="space-y-2"><Label htmlFor="edit-code">Program Code</Label><Input id="edit-code" value={selectedProgram.code} onChange={(e) => setSelectedProgram({ ...selectedProgram, code: e.target.value })} /></div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="edit-description">Description</Label><Textarea id="edit-description" value={selectedProgram.description} onChange={(e) => setSelectedProgram({ ...selectedProgram, description: e.target.value })} rows={3} /></div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2"><Label htmlFor="edit-totalCredits">Total Credits</Label><Input id="edit-totalCredits" type="number" value={selectedProgram.totalCredits} onChange={(e) => setSelectedProgram({ ...selectedProgram, totalCredits: parseInt(e.target.value) })} /></div>
                                <div className="space-y-2"><Label htmlFor="edit-duration">Duration (Years)</Label><Input id="edit-duration" type="number" value={selectedProgram.duration} onChange={(e) => setSelectedProgram({ ...selectedProgram, duration: parseInt(e.target.value) })} /></div>
                            </div>
                        </div>
                    )}
                    <DialogFooter><Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button><Button onClick={handleUpdateProgram}><Save className="mr-2 h-4 w-4" />Save Changes</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
